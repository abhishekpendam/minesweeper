"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export type CellState = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborCount: number;
};

export type GameStatus = "idle" | "playing" | "won" | "lost";

export type Difficulty = "beginner" | "intermediate" | "expert";

export const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { rows: number; cols: number; mines: number }
> = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 },
};

function createEmptyBoard(rows: number, cols: number): CellState[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborCount: 0,
    }))
  );
}

function placeMines(
  board: CellState[][],
  rows: number,
  cols: number,
  mines: number,
  safeRow: number,
  safeCol: number
): CellState[][] {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
  let placed = 0;

  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    // Don't place mine on first click or its neighbors
    if (
      Math.abs(r - safeRow) <= 1 &&
      Math.abs(c - safeCol) <= 1
    ) continue;
    if (newBoard[r][c].isMine) continue;
    newBoard[r][c].isMine = true;
    placed++;
  }

  // Calculate neighbor counts
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (newBoard[r][c].isMine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newBoard[nr][nc].isMine) {
            count++;
          }
        }
      }
      newBoard[r][c].neighborCount = count;
    }
  }

  return newBoard;
}

function revealCells(
  board: CellState[][],
  rows: number,
  cols: number,
  startRow: number,
  startCol: number
): CellState[][] {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
  const queue: [number, number][] = [[startRow, startCol]];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    const key = `${r},${c}`;
    if (visited.has(key)) continue;
    visited.add(key);

    if (newBoard[r][c].isFlagged) continue;
    newBoard[r][c].isRevealed = true;

    if (newBoard[r][c].neighborCount === 0 && !newBoard[r][c].isMine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (
            nr >= 0 && nr < rows &&
            nc >= 0 && nc < cols &&
            !newBoard[nr][nc].isRevealed &&
            !newBoard[nr][nc].isMine
          ) {
            queue.push([nr, nc]);
          }
        }
      }
    }
  }

  return newBoard;
}

export function useMinesweeper(difficulty: Difficulty) {
  const config = DIFFICULTY_CONFIG[difficulty];
  const [board, setBoard] = useState<CellState[][]>(() =>
    createEmptyBoard(config.rows, config.cols)
  );
  const [status, setStatus] = useState<GameStatus>("idle");
  const [flagCount, setFlagCount] = useState(0);
  const [time, setTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setTime((t) => Math.min(t + 1, 999));
    }, 1000);
  }, [stopTimer]);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  const resetGame = useCallback(() => {
    stopTimer();
    setBoard(createEmptyBoard(config.rows, config.cols));
    setStatus("idle");
    setFlagCount(0);
    setTime(0);
  }, [config.rows, config.cols, stopTimer]);

  // Reset when difficulty changes
  useEffect(() => {
    resetGame();
  }, [difficulty]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkWin = useCallback(
    (b: CellState[][]): boolean => {
      for (let r = 0; r < config.rows; r++) {
        for (let c = 0; c < config.cols; c++) {
          if (!b[r][c].isMine && !b[r][c].isRevealed) return false;
        }
      }
      return true;
    },
    [config.rows, config.cols]
  );

  const revealCell = useCallback(
    (row: number, col: number) => {
      if (status === "won" || status === "lost") return;
      setBoard((prev) => {
        const cell = prev[row][col];
        if (cell.isRevealed || cell.isFlagged) return prev;

        let currentBoard = prev;

        // First click: place mines
        if (status === "idle") {
          currentBoard = placeMines(
            prev,
            config.rows,
            config.cols,
            config.mines,
            row,
            col
          );
          setStatus("playing");
          startTimer();
        }

        if (currentBoard[row][col].isMine) {
          // Reveal all mines
          const lostBoard = currentBoard.map((r) =>
            r.map((c) => (c.isMine ? { ...c, isRevealed: true } : { ...c }))
          );
          lostBoard[row][col] = { ...lostBoard[row][col], isRevealed: true };
          setStatus("lost");
          stopTimer();
          return lostBoard;
        }

        const revealed = revealCells(
          currentBoard,
          config.rows,
          config.cols,
          row,
          col
        );

        if (checkWin(revealed)) {
          setStatus("won");
          stopTimer();
        }

        return revealed;
      });
    },
    [status, config, startTimer, stopTimer, checkWin]
  );

  const chordCell = useCallback(
    (row: number, col: number) => {
      if (status !== "playing") return;
      setBoard((prev) => {
        const cell = prev[row][col];
        if (!cell.isRevealed || cell.neighborCount === 0) return prev;

        // Count adjacent flags
        let flaggedNeighbors = 0;
        const unrevealed: [number, number][] = [];
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = row + dr;
            const nc = col + dc;
            if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols) {
              if (prev[nr][nc].isFlagged) flaggedNeighbors++;
              else if (!prev[nr][nc].isRevealed) unrevealed.push([nr, nc]);
            }
          }
        }

        if (flaggedNeighbors !== cell.neighborCount) return prev;

        // Chord: reveal all unflagged neighbors
        let current = prev;
        let hitMine = false;
        let mineRow = -1, mineCol = -1;

        for (const [nr, nc] of unrevealed) {
          if (current[nr][nc].isMine) {
            hitMine = true;
            mineRow = nr;
            mineCol = nc;
          }
        }

        if (hitMine) {
          const lostBoard = current.map((r) =>
            r.map((c) => (c.isMine ? { ...c, isRevealed: true } : { ...c }))
          );
          // Mark incorrectly flagged
          for (let r = 0; r < config.rows; r++) {
            for (let c = 0; c < config.cols; c++) {
              if (lostBoard[r][c].isFlagged && !lostBoard[r][c].isMine) {
                lostBoard[r][c] = { ...lostBoard[r][c], isRevealed: true };
              }
            }
          }
          setStatus("lost");
          stopTimer();
          return lostBoard;
        }

        for (const [nr, nc] of unrevealed) {
          current = revealCells(current, config.rows, config.cols, nr, nc);
        }

        if (checkWin(current)) {
          setStatus("won");
          stopTimer();
        }

        return current;
      });
    },
    [status, config, stopTimer, checkWin]
  );

  const toggleFlag = useCallback(
    (row: number, col: number) => {
      if (status !== "playing") return;
      setBoard((prev) => {
        const cell = prev[row][col];
        if (cell.isRevealed) return prev;
        const newBoard = prev.map((r) => r.map((c) => ({ ...c })));
        newBoard[row][col].isFlagged = !cell.isFlagged;
        setFlagCount((f) => f + (cell.isFlagged ? -1 : 1));
        return newBoard;
      });
    },
    [status]
  );

  return {
    board,
    status,
    flagCount,
    time,
    minesLeft: config.mines - flagCount,
    rows: config.rows,
    cols: config.cols,
    revealCell,
    toggleFlag,
    chordCell,
    resetGame,
  };
}
