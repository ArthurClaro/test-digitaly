'use client';

import { Cell } from './Cell';
import type { Board as BoardType } from '@/lib/minesweeper/types';

export interface BoardProps {
  readonly board: BoardType;
  readonly disabled: boolean;
  readonly onReveal: (row: number, col: number) => void;
  readonly onFlag: (row: number, col: number) => void;
}

export function Board({ board, disabled, onReveal, onFlag }: BoardProps) {
  return (
    <div
      className="inline-block select-none border-2 border-slate-400 bg-slate-200 p-2 shadow-inner"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="flex flex-col gap-0">
        {board.map((row, r) => (
          <div key={r} className="flex flex-row gap-0">
            {row.map((cell) => (
              <Cell
                key={`${r}-${cell.col}`}
                cell={cell}
                disabled={disabled}
                onReveal={onReveal}
                onFlag={onFlag}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
