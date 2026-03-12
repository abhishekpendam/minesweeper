"use client";

import { CellState } from "../hooks/useMinesweeper";

const NUMBER_COLORS: Record<number, string> = {
  1: "text-blue-600",
  2: "text-green-600",
  3: "text-red-600",
  4: "text-blue-900",
  5: "text-red-900",
  6: "text-cyan-600",
  7: "text-black",
  8: "text-gray-600",
};

type CellProps = {
  cell: CellState;
  row: number;
  col: number;
  isExploded?: boolean;
  onReveal: (row: number, col: number) => void;
  onFlag: (row: number, col: number) => void;
  onChord: (row: number, col: number) => void;
  gameOver: boolean;
};

export default function Cell({
  cell,
  row,
  col,
  isExploded,
  onReveal,
  onFlag,
  onChord,
  gameOver,
}: CellProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (cell.isRevealed) {
      onChord(row, col);
    } else {
      onReveal(row, col);
    }
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!cell.isRevealed) {
      onFlag(row, col);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (cell.isRevealed) {
      onChord(row, col);
    }
  };

  let content: React.ReactNode = null;
  let cellClass =
    "w-8 h-8 flex items-center justify-center text-sm font-bold select-none cursor-pointer border border-gray-400 transition-colors duration-75 ";

  if (cell.isRevealed) {
    if (cell.isMine) {
      cellClass += isExploded
        ? "bg-red-500 "
        : "bg-gray-300 ";
      content = "💣";
    } else {
      cellClass += "bg-gray-200 border-gray-300 cursor-default ";
      if (cell.neighborCount > 0) {
        content = (
          <span className={NUMBER_COLORS[cell.neighborCount] ?? "text-black"}>
            {cell.neighborCount}
          </span>
        );
      }
    }
  } else if (cell.isFlagged) {
    cellClass += "bg-gray-400 hover:bg-gray-350 ";
    content = "🚩";
  } else {
    cellClass += gameOver
      ? "bg-gray-300 "
      : "bg-gray-400 hover:bg-gray-350 active:bg-gray-200 ";
  }

  return (
    <div
      className={cellClass}
      style={{ minWidth: "2rem", minHeight: "2rem" }}
      onClick={handleClick}
      onContextMenu={handleRightClick}
      onDoubleClick={handleDoubleClick}
    >
      {content}
    </div>
  );
}
