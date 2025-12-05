/**
 * Game configuration and word list for Business Lexicon Lock
 */

export interface WordEntry {
  word: string;
  clue: string;
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface DifficultyConfig {
  wordCount: number;
  duration: number;
  gridSize: number;
}

export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    wordCount: 8,
    duration: 120, // 2 minutes
    gridSize: 12,
  },
  medium: {
    wordCount: 12,
    duration: 90, // 1.5 minutes
    gridSize: 12,
  },
  hard: {
    wordCount: 15,
    duration: 60, // 1 minute
    gridSize: 12,
  },
};

export const GAME_CONFIG = {
  GRID_SIZE: 12,
  GAME_DURATION: 90, // seconds
  MAX_PLAYERS: 8,
  POINTS_PER_WORD: 10,
};

// Expanded word pool - 24 business terms for variety
export const BUSINESS_WORDS_POOL: WordEntry[] = [
  { word: "FINTECH", clue: "The fusion of finance and technology" },
  { word: "DATA", clue: "Raw facts and figures for analysis" },
  { word: "STRATEGY", clue: "A plan of action to achieve goals" },
  { word: "MARKETING", clue: "The study of markets and promotion" },
  { word: "ENTREPRENEUR", clue: "Someone who starts a business venture" },
  { word: "HUMANCAPITAL", clue: "The skills and knowledge of workers" },
  { word: "LOGISTICS", clue: "Managing the flow of goods" },
  { word: "ANALYTICS", clue: "Systematic analysis of data" },
  { word: "ADAPTATION", clue: "Adjusting to new conditions" },
  { word: "INNOVATION", clue: "Introducing new ideas or methods" },
  { word: "RISK", clue: "Potential for loss or uncertainty" },
  { word: "ETHICS", clue: "Moral principles in business" },
  { word: "REVENUE", clue: "Income generated from business activities" },
  { word: "PROFIT", clue: "Financial gain after expenses" },
  { word: "INVESTMENT", clue: "Allocating resources for future returns" },
  { word: "BRAND", clue: "A company's identity and reputation" },
  { word: "SUPPLY", clue: "The quantity of goods available" },
  { word: "DEMAND", clue: "Consumer desire for products" },
  { word: "EQUITY", clue: "Ownership interest in a company" },
  { word: "CAPITAL", clue: "Financial resources for business" },
  { word: "ASSETS", clue: "Resources owned by a business" },
  { word: "MARKET", clue: "Where buyers and sellers meet" },
  { word: "CONSUMER", clue: "A person who purchases goods" },
  { word: "GROWTH", clue: "Expansion of business operations" },
];

/**
 * Randomly select words from the pool for a game session
 * Adds word length hint to each clue
 */
export function getRandomWords(count: number = 12): WordEntry[] {
  const shuffled = [...BUSINESS_WORDS_POOL].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);
  
  // Add word length hint to clues
  return selected.map(entry => ({
    word: entry.word,
    clue: `${entry.clue} (${entry.word.length} letters)`,
  }));
}

export const PLAYER_COLORS = [
  "#3B82F6", // blue
  "#EF4444", // red
  "#10B981", // green
  "#F59E0B", // amber
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#F97316", // orange
];
