"use client";

import Cell from "./Cell";
import { CellState, GameStatus } from "../hooks/useMinesweeper";

type BoardProps = {
  board: CellState[][];
  status: GameStatus;
  onReveal: (row: number, col: number) => void;
  onFlag: (row: number, col: number) => void;
  onChord: (row: number, col: number) => void;
  explodedCell?: [number, number] | null;
};

export default function Board({
  board,
  status,
  onReveal,
  onFlag,
  onChord,
  explodedCell,
}: BoardProps) {
  const gameOver = status === "won" || status === "lost";

  return (
    <div
      className="inline-block border-2 border-gray-500 shadow-lg"
      onContextMenu={(e) => e.preventDefault()}
    >
      {board.map((row, r) => (
        <div key={r} className="flex">
          {row.map((cell, c) => (
            <Cell
              key={c}
              cell={cell}
              row={r}
              col={c}
              isExploded={
                explodedCell !== null &&
                explodedCell?.[0] === r &&
                explodedCell?.[1] === c
              }
              onReveal={onReveal}
              onFlag={onFlag}
              onChord={onChord}
              gameOver={gameOver}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
