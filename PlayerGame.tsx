import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "../lib/trpc";
import { WordSearchGrid } from "../components/WordSearchGrid";
import { GameState, Player, WordSelection } from "../types/game";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useSound } from "../hooks/useSound";

export function PlayerGame() {
  const params = useParams<{ sessionId: string; playerId: string }>();
  const [, setLocation] = useLocation();
  const sessionId = params.sessionId;
  const playerId = params.playerId;
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(90);
  const [isGameActive, setIsGameActive] = useState(false);
  const [previousFoundWordsCount, setPreviousFoundWordsCount] = useState(0);
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const { playSuccess, playCountdownBeep, playGameStart, playGameEnd } = useSound();

  const { data, refetch } = trpc.game.getGameState.useQuery(
    { sessionId: Number(sessionId) },
    { enabled: !!sessionId, refetchInterval: 1000 }
  );

  const submitWordMutation = trpc.game.submitWord.useMutation({
    onSuccess: () => {
      playSuccess(); // Play success sound when word is found
      refetch();
    },
    onError: (error) => {
      console.error("Error submitting word:", error);
    },
  });

  useEffect(() => {
    if (data) {
      setGameState(data as GameState);
      const player = data.players.find((p) => p.id === Number(playerId));
      if (player) {
        setCurrentPlayer(player);
      }
      
      // Update game active status
      setIsGameActive(data.session.status === "active");
      
      // Calculate time remaining
      if (data.session.startTime && data.session.status === "active") {
        const elapsed = Math.floor((Date.now() - new Date(data.session.startTime).getTime()) / 1000);
        const gameDuration = data.session.duration || 90;
        const remaining = Math.max(0, gameDuration - elapsed);
        setTimeRemaining(remaining);
        
        // Play game start sound once
        if (!hasGameStarted) {
          playGameStart();
          setHasGameStarted(true);
        }
        
        // Play countdown beep for last 10 seconds
        if (remaining <= 10 && remaining > 0) {
          playCountdownBeep();
        }
        
        // Play game end sound when time runs out
        if (remaining === 0 && hasGameStarted) {
          playGameEnd();
        }
      }
    }
  }, [data, playerId]);

  useEffect(() => {
    if (!isGameActive) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsGameActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isGameActive]);

  const handleWordSelect = (selection: WordSelection & { endRow: number; endCol: number }) => {
    if (!gameState || !currentPlayer || !isGameActive) return;
    
    // Extract the word from the grid
    const { startRow, startCol, endRow, endCol } = selection;
    const word = extractWord(gameState.session.grid, startRow, startCol, endRow, endCol);
    
    if (word.length < 3) return; // Minimum word length
    
    submitWordMutation.mutate({
      sessionId: gameState.session.id,
      playerId: currentPlayer.id,
      word,
      startRow,
      startCol,
      endRow,
      endCol,
    });
  };

  const extractWord = (
    grid: string[][],
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number
  ): string => {
    let word = "";
    const rowDiff = endRow - startRow;
    const colDiff = endCol - startCol;
    const length = Math.max(Math.abs(rowDiff), Math.abs(colDiff)) + 1;
    
    const rowStep = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
    const colStep = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);
    
    for (let i = 0; i < length; i++) {
      const row = startRow + i * rowStep;
      const col = startCol + i * colStep;
      word += grid[row][col];
    }
    
    return word;
  };

  const getClueOrWord = (placedWord: any) => {
    const found = gameState?.foundWords.find((fw) => fw.word === placedWord.word);
    return found ? placedWord.word : placedWord.clue;
  };

  if (!gameState || !currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-3 md:p-6">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        {/* Header Card */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-3 md:pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <img
                  src="/assets/np-logo.png"
                  alt="NP"
                  className="h-8 md:h-10 flex-shrink-0"
                />
                <div className="min-w-0">
                  <CardTitle className="text-lg md:text-xl truncate">The Business Lexicon Lock</CardTitle>
                  <p className="text-xs md:text-sm text-gray-600 mt-1 truncate">
                    Player: <span className="font-semibold" style={{ color: currentPlayer.color }}>{currentPlayer.name}</span>
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`text-3xl md:text-4xl font-bold transition-all ${
                  timeRemaining <= 10 ? "text-red-600 animate-pulse scale-110" : "text-blue-600"
                }`}>
                  {timeRemaining}s
                </div>
                <div className="text-xs md:text-sm text-gray-600">Score: <span className="font-bold">{currentPlayer.score}</span></div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Status Messages */}
        {!isGameActive && gameState.session.status === "waiting" && (
          <Card className="bg-amber-50 border-amber-200 shadow-md">
            <CardContent className="pt-6">
              <p className="text-center text-amber-800 font-medium">⏳ Waiting for game to start...</p>
            </CardContent>
          </Card>
        )}

        {gameState.session.status === "completed" && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-md">
            <CardContent className="pt-6">
              <p className="text-center text-green-800 font-semibold text-lg">🎉 Game Over!</p>
              <p className="text-center text-green-700 mt-2 font-bold">Final Score: {currentPlayer.score}</p>
            </CardContent>
          </Card>
        )}

        {/* Word Search Grid */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
          <CardContent className="pt-6 md:pt-8">
            <WordSearchGrid
              grid={gameState.session.grid}
              foundWords={gameState.foundWords}
              playerColor={currentPlayer.color}
              onWordSelect={handleWordSelect}
              disabled={!isGameActive}
            />
          </CardContent>
        </Card>

        {/* Two Column Layout for Clues and Players */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Clues */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-base md:text-lg">Find These Words</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                {gameState.session.words.map((word, index) => {
                  const found = gameState.foundWords.find((fw) => fw.word === word.word);
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                        found
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300"
                          : "bg-white border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-sm ${found ? "text-green-700 font-bold line-through" : "text-gray-700"}`}>
                          {getClueOrWord(word)}
                        </span>
                        {found && <Badge className="bg-green-600 text-white text-xs">✓</Badge>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Players */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-base md:text-lg">Players</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {gameState.players.map((player, idx) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-300"
                    style={{
                      backgroundColor: player.color + "10",
                      borderColor: player.color + "30",
                    }}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                        style={{ backgroundColor: player.color }}
                      >
                        {idx + 1}
                      </div>
                      <span className="font-semibold text-sm truncate text-gray-900">{player.name}</span>
                    </div>
                    <span className="text-lg font-bold flex-shrink-0" style={{ color: player.color }}>
                      {player.score}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
