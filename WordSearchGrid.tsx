import { useState, useRef, useEffect } from "react";
import { FoundWord, WordSelection } from "../types/game";

interface WordSearchGridProps {
  grid: string[][];
  foundWords: FoundWord[];
  playerColor: string;
  onWordSelect: (selection: WordSelection & { endRow: number; endCol: number }) => void;
  disabled?: boolean;
}

export function WordSearchGrid({
  grid,
  foundWords,
  playerColor,
  onWordSelect,
  disabled = false,
}: WordSearchGridProps) {
  const [selection, setSelection] = useState<WordSelection | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const getCellPosition = (clientX: number, clientY: number): { row: number; col: number } | null => {
    if (!gridRef.current) return null;
    
    const rect = gridRef.current.getBoundingClientRect();
    const cellSize = rect.width / grid.length;
    
    const col = Math.floor((clientX - rect.left) / cellSize);
    const row = Math.floor((clientY - rect.top) / cellSize);
    
    if (row >= 0 && row < grid.length && col >= 0 && col < grid[0].length) {
      return { row, col };
    }
    
    return null;
  };

  const handleStart = (clientX: number, clientY: number) => {
    if (disabled) return;
    
    const pos = getCellPosition(clientX, clientY);
    if (pos) {
      setSelection({
        startRow: pos.row,
        startCol: pos.col,
        endRow: null,
        endCol: null,
      });
      setIsSelecting(true);
    }
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isSelecting || !selection || disabled) return;
    
    const pos = getCellPosition(clientX, clientY);
    if (pos) {
      setSelection({
        ...selection,
        endRow: pos.row,
        endCol: pos.col,
      });
    }
  };

  const handleEnd = () => {
    if (!selection || disabled) {
      setIsSelecting(false);
      return;
    }
    
    if (selection.endRow !== null && selection.endCol !== null) {
      onWordSelect({
        startRow: selection.startRow,
        startCol: selection.startCol,
        endRow: selection.endRow,
        endCol: selection.endCol,
      });
    }
    
    setSelection(null);
    setIsSelecting(false);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleEnd();
  };

  const isCellHighlighted = (row: number, col: number): string | null => {
    // Check if cell is part of a found word
    for (const foundWord of foundWords) {
      const cells = getWordCells(
        foundWord.startRow,
        foundWord.startCol,
        foundWord.endRow,
        foundWord.endCol
      );
      
      if (cells.some(cell => cell.row === row && cell.col === col)) {
        // Find the player color for this word
        return foundWord.playerId ? playerColor : "#10B981"; // Default green
      }
    }
    
    // Check if cell is part of current selection
    if (selection && selection.endRow !== null && selection.endCol !== null) {
      const cells = getWordCells(
        selection.startRow,
        selection.startCol,
        selection.endRow,
        selection.endCol
      );
      
      if (cells.some(cell => cell.row === row && cell.col === col)) {
        return playerColor + "80"; // Semi-transparent
      }
    }
    
    return null;
  };

  const getWordCells = (
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number
  ): Array<{ row: number; col: number }> => {
    const cells: Array<{ row: number; col: number }> = [];
    
    const rowDiff = endRow - startRow;
    const colDiff = endCol - startCol;
    const length = Math.max(Math.abs(rowDiff), Math.abs(colDiff)) + 1;
    
    const rowStep = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
    const colStep = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);
    
    for (let i = 0; i < length; i++) {
      cells.push({
        row: startRow + i * rowStep,
        col: startCol + i * colStep,
      });
    }
    
    return cells;
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isSelecting) {
        handleEnd();
      }
    };
    
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [isSelecting, selection]);

  return (
    <div
      ref={gridRef}
      className={`grid gap-1.5 select-none touch-none rounded-xl overflow-hidden shadow-lg ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      style={{
        gridTemplateColumns: `repeat(${grid[0].length}, 1fr)`,
        aspectRatio: "1",
        backgroundColor: "#f8fafc",
        padding: "1rem",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {grid.map((row, rowIndex) =>
        row.map((letter, colIndex) => {
          const highlightColor = isCellHighlighted(rowIndex, colIndex);
          
          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="flex items-center justify-center font-bold rounded-lg transition-all duration-200 hover:scale-105 shadow-sm"
              style={{
                fontSize: window.innerWidth < 768 ? "0.875rem" : "1.125rem",
                backgroundColor: highlightColor || "#ffffff",
                color: highlightColor ? "#ffffff" : "#1f2937",
                border: highlightColor ? `2px solid ${playerColor}` : "1px solid #e2e8f0",
                aspectRatio: "1",
                cursor: disabled ? "not-allowed" : "grab",
              }}
            >
              {letter}
            </div>
          );
        })
      )}
    </div>
  );
}
