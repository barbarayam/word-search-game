import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { foundWords, gameSessions, players } from "../drizzle/schema";
import { generateSessionCode, generateWordSearchGrid } from "./gridGenerator";
import { GAME_CONFIG, PLAYER_COLORS, DIFFICULTY_CONFIGS, DifficultyLevel } from "./gameData";
import { eq, and, desc, sql } from "drizzle-orm";

export const gameRouter = router({
  /**
   * Create a new game session with difficulty level
   */
  createSession: publicProcedure
    .input(z.object({
      difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
    }).optional())
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const difficulty = (input?.difficulty || "medium") as DifficultyLevel;
      const config = DIFFICULTY_CONFIGS[difficulty];
      
      const sessionCode = generateSessionCode();
      const { grid, placedWords } = generateWordSearchGrid(config.wordCount);
      
      const result = await db.insert(gameSessions).values({
        sessionCode,
        gridData: JSON.stringify(grid),
        wordsData: JSON.stringify(placedWords),
        difficulty,
        duration: config.duration,
        status: "waiting",
        maxPlayers: GAME_CONFIG.MAX_PLAYERS,
      });
      
      const sessionId = Number(result[0].insertId);
      
      return {
        sessionId,
        sessionCode,
        grid,
        words: placedWords,
        difficulty,
        duration: config.duration,
      };
    }),

  /**
   * Get session details
   */
  getSession: publicProcedure
    .input(z.object({ sessionCode: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [session] = await db
        .select()
        .from(gameSessions)
        .where(eq(gameSessions.sessionCode, input.sessionCode))
        .limit(1);
      
      if (!session) {
        throw new Error("Session not found");
      }
      
      const sessionPlayers = await db
        .select()
        .from(players)
        .where(eq(players.sessionId, session.id))
        .orderBy(players.joinedAt);
      
      const sessionFoundWords = await db
        .select()
        .from(foundWords)
        .where(eq(foundWords.sessionId, session.id))
        .orderBy(foundWords.foundAt);
      
      return {
        session: {
          ...session,
          grid: JSON.parse(session.gridData),
          words: JSON.parse(session.wordsData),
        },
        players: sessionPlayers,
        foundWords: sessionFoundWords,
      };
    }),

  /**
   * Join a game session as a player
   */
  joinSession: publicProcedure
    .input(z.object({
      sessionCode: z.string(),
      playerName: z.string().min(1).max(100),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [session] = await db
        .select()
        .from(gameSessions)
        .where(eq(gameSessions.sessionCode, input.sessionCode))
        .limit(1);
      
      if (!session) {
        throw new Error("Session not found");
      }
      
      if (session.status === "completed") {
        throw new Error("Game has already ended");
      }
      
      const existingPlayers = await db
        .select()
        .from(players)
        .where(eq(players.sessionId, session.id));
      
      if (existingPlayers.length >= session.maxPlayers) {
        throw new Error("Session is full");
      }
      
      // Assign color based on player count
      const color = PLAYER_COLORS[existingPlayers.length % PLAYER_COLORS.length];
      
      const result = await db.insert(players).values({
        sessionId: session.id,
        name: input.playerName,
        color,
        score: 0,
      });
      
      const playerId = Number(result[0].insertId);
      
      const [player] = await db
        .select()
        .from(players)
        .where(eq(players.id, playerId))
        .limit(1);
      
      return {
        player,
        sessionId: session.id,
      };
    }),

  /**
   * Start the game
   */
  startGame: publicProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db
        .update(gameSessions)
        .set({
          status: "active",
          startTime: new Date(),
        })
        .where(eq(gameSessions.id, input.sessionId));
      
      return { success: true };
    }),

  /**
   * Submit a found word
   */
  submitWord: publicProcedure
    .input(z.object({
      sessionId: z.number(),
      playerId: z.number(),
      word: z.string(),
      startRow: z.number(),
      startCol: z.number(),
      endRow: z.number(),
      endCol: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Check if word was already found
      const existing = await db
        .select()
        .from(foundWords)
        .where(
          and(
            eq(foundWords.sessionId, input.sessionId),
            eq(foundWords.word, input.word.toUpperCase())
          )
        )
        .limit(1);
      
      if (existing.length > 0) {
        throw new Error("Word already found");
      }
      
      // Verify the word exists in the session
      const [session] = await db
        .select()
        .from(gameSessions)
        .where(eq(gameSessions.id, input.sessionId))
        .limit(1);
      
      if (!session) {
        throw new Error("Session not found");
      }
      
      const placedWords = JSON.parse(session.wordsData);
      const wordEntry = placedWords.find((w: any) => w.word === input.word.toUpperCase());
      
      if (!wordEntry) {
        throw new Error("Invalid word");
      }
      
      // Record the found word
      await db.insert(foundWords).values({
        sessionId: input.sessionId,
        playerId: input.playerId,
        word: input.word.toUpperCase(),
        startRow: input.startRow,
        startCol: input.startCol,
        endRow: input.endRow,
        endCol: input.endCol,
      });
      
      // Update player score
      await db
        .update(players)
        .set({
          score: sql`${players.score} + ${GAME_CONFIG.POINTS_PER_WORD}`,
        })
        .where(eq(players.id, input.playerId));
      
      // Get updated player info
      const [updatedPlayer] = await db
        .select()
        .from(players)
        .where(eq(players.id, input.playerId))
        .limit(1);
      
      return { 
        success: true,
        player: updatedPlayer,
        word: input.word.toUpperCase(),
      };
    }),

  /**
   * Get real-time game state
   */
  getGameState: publicProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [session] = await db
        .select()
        .from(gameSessions)
        .where(eq(gameSessions.id, input.sessionId))
        .limit(1);
      
      if (!session) {
        throw new Error("Session not found");
      }
      
      const sessionPlayers = await db
        .select()
        .from(players)
        .where(eq(players.sessionId, input.sessionId))
        .orderBy(desc(players.score));
      
      const sessionFoundWords = await db
        .select()
        .from(foundWords)
        .where(eq(foundWords.sessionId, input.sessionId))
        .orderBy(foundWords.foundAt);
      
      return {
        session: {
          ...session,
          grid: JSON.parse(session.gridData),
          words: JSON.parse(session.wordsData),
        },
        players: sessionPlayers,
        foundWords: sessionFoundWords,
      };
    }),

  /**
   * End the game
   */
  endGame: publicProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db
        .update(gameSessions)
        .set({
          status: "completed",
          endTime: new Date(),
        })
        .where(eq(gameSessions.id, input.sessionId));
      
      return { success: true };
    }),
});
