import { getRandomWords, GAME_CONFIG, WordEntry } from "./gameData";

export interface GridCell {
  letter: string;
  row: number;
  col: number;
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

export interface WordSearchGrid {
  grid: string[][];
  placedWords: PlacedWord[];
}

const DIRECTIONS = [
  { name: "horizontal" as const, dr: 0, dc: 1 },
  { name: "vertical" as const, dr: 1, dc: 0 },
  { name: "diagonal" as const, dr: 1, dc: 1 },
];

/**
 * Check if a word can be placed at a specific position
 */
function canPlaceWord(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  dr: number,
  dc: number
): boolean {
  const size = GAME_CONFIG.GRID_SIZE;
  
  // Check if word fits in grid
  const endRow = row + (word.length - 1) * dr;
  const endCol = col + (word.length - 1) * dc;
  
  if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) {
    return false;
  }
  
  // Check if cells are empty or match existing letters
  for (let i = 0; i < word.length; i++) {
    const r = row + i * dr;
    const c = col + i * dc;
    const currentCell = grid[r][c];
    
    if (currentCell !== "" && currentCell !== word[i]) {
      return false;
    }
  }
  
  return true;
}

/**
 * Place a word on the grid
 */
function placeWord(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  dr: number,
  dc: number
): void {
  for (let i = 0; i < word.length; i++) {
    const r = row + i * dr;
    const c = col + i * dc;
    grid[r][c] = word[i];
  }
}

/**
 * Generate a word search grid with randomly selected business terms
 * @param wordCount - Number of words to include (default: 12)
 */
export function generateWordSearchGrid(wordCount: number = 12): WordSearchGrid {
  const size = GAME_CONFIG.GRID_SIZE;
  const grid: string[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(""));
  
  const placedWords: PlacedWord[] = [];
  // Get random words for this game session
  const words = getRandomWords(wordCount).sort((a, b) => b.word.length - a.word.length);
  
  // Try to place each word
  for (const wordEntry of words) {
    const word = wordEntry.word.toUpperCase();
    let placed = false;
    let attempts = 0;
    const maxAttempts = 100;
    
    while (!placed && attempts < maxAttempts) {
      attempts++;
      
      // Random position and direction
      const direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      
      if (canPlaceWord(grid, word, row, col, direction.dr, direction.dc)) {
        placeWord(grid, word, row, col, direction.dr, direction.dc);
        
        const endRow = row + (word.length - 1) * direction.dr;
        const endCol = col + (word.length - 1) * direction.dc;
        
        placedWords.push({
          word: word,
          clue: wordEntry.clue,
          startRow: row,
          startCol: col,
          endRow: endRow,
          endCol: endCol,
          direction: direction.name,
        });
        
        placed = true;
      }
    }
    
    if (!placed) {
      console.warn(`Could not place word: ${word}`);
    }
  }
  
  // Fill empty cells with random letters
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === "") {
        grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
  }
  
  return { grid, placedWords };
}

/**
 * Generate a random session code
 */
export function generateSessionCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude similar looking chars
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
