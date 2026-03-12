"use client";

import { useState } from "react";
import Board from "./Board";
import { Difficulty, DIFFICULTY_CONFIG, useMinesweeper } from "../hooks/useMinesweeper";

export default function Minesweeper() {
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [pendingDifficulty, setPendingDifficulty] = useState<Difficulty>("beginner");

  const {
    board,
    status,
    minesLeft,
    time,
    revealCell,
    toggleFlag,
    chordCell,
    resetGame,
  } = useMinesweeper(difficulty);

  const handleDifficultyChange = (d: Difficulty) => {
    setPendingDifficulty(d);
    setDifficulty(d);
  };

  const statusEmoji = () => {
    if (status === "won") return "😎";
    if (status === "lost") return "😵";
    return "🙂";
  };

  const formatTime = (t: number) => String(t).padStart(3, "0");
  const formatMines = (m: number) => {
    if (m < 0) return `-${String(Math.abs(m)).padStart(2, "0")}`;
    return String(Math.min(m, 999)).padStart(3, "0");
  };

  const difficultyOptions: { label: string; value: Difficulty }[] = [
    { label: "Beginner (9×9, 10 mines)", value: "beginner" },
    { label: "Intermediate (16×16, 40 mines)", value: "intermediate" },
    { label: "Expert (16×30, 99 mines)", value: "expert" },
  ];

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight text-gray-800">
        💣 Minesweeper
      </h1>

      {/* Difficulty selector */}
      <div className="flex gap-2 flex-wrap justify-center">
        {difficultyOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleDifficultyChange(opt.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              pendingDifficulty === opt.value
                ? "bg-blue-600 text-white border-blue-700"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Game panel */}
      <div className="bg-gray-100 border-4 border-gray-400 rounded p-3 shadow-inner">
        {/* Header: mines counter, reset, timer */}
        <div className="flex items-center justify-between mb-3 px-2">
          {/* Mine counter */}
          <div className="bg-black text-red-500 font-mono font-bold text-xl px-2 py-1 rounded min-w-[4rem] text-center tracking-widest">
            {formatMines(minesLeft)}
          </div>

          {/* Reset button */}
          <button
            onClick={resetGame}
            className="text-2xl w-10 h-10 bg-gray-300 border-2 border-gray-400 rounded hover:bg-gray-200 active:bg-gray-400 flex items-center justify-center transition-colors"
            title="New Game"
          >
            {statusEmoji()}
          </button>

          {/* Timer */}
          <div className="bg-black text-red-500 font-mono font-bold text-xl px-2 py-1 rounded min-w-[4rem] text-center tracking-widest">
            {formatTime(time)}
          </div>
        </div>

        {/* Board */}
        <Board
          board={board}
          status={status}
          onReveal={revealCell}
          onFlag={toggleFlag}
          onChord={chordCell}
        />
      </div>

      {/* Status message */}
      {status === "won" && (
        <div className="text-green-600 font-bold text-xl animate-bounce">
          You won! 🎉 Great job!
        </div>
      )}
      {status === "lost" && (
        <div className="text-red-600 font-bold text-xl">
          Game over! 💥 Try again?
        </div>
      )}

      {/* Instructions */}
      <div className="text-gray-500 text-xs text-center max-w-sm space-y-1">
        <p>Left-click to reveal · Right-click to flag · Click revealed number to chord</p>
        <p>Chord: if flags match number, auto-reveals adjacent cells</p>
      </div>
    </div>
  );
}
