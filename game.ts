export interface GridCell {
  letter: string;
  row: number;
  col: number;
  isHighlighted?: boolean;
  highlightColor?: string;
}

export interface PlacedWord {
  word: string;
  clue: string;
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  direction: "horizontal" | "vertical" | "diagonal";
}

export interface Player {
  id: number;
  sessionId: number;
  name: string;
  color: string;
  score: number;
  joinedAt: Date;
}

export interface FoundWord {
  id: number;
  sessionId: number;
  playerId: number;
  word: string;
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  foundAt: Date;
}

export interface GameSession {
  id: number;
  sessionCode: string;
  status: "waiting" | "active" | "completed";
  maxPlayers: number;
  startTime: Date | null;
  endTime: Date | null;
  grid: string[][];
  words: PlacedWord[];
}

export interface GameState {
  session: GameSession;
  players: Player[];
  foundWords: FoundWord[];
}

export interface WordSelection {
  startRow: number;
  startCol: number;
  endRow: number | null;
  endCol: number | null;
}
