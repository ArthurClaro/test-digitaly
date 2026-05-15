'use client';

import { memo } from 'react';
import { Flag } from 'lucide-react';
import type { Cell as CellType } from '@/lib/minesweeper/types';
import { cn } from '@/lib/utils';

const ADJACENT_COLORS: Readonly<Record<number, string>> = {
  1: 'text-blue-600',
  2: 'text-green-700',
  3: 'text-red-600',
  4: 'text-blue-900',
  5: 'text-red-900',
  6: 'text-teal-600',
  7: 'text-black',
  8: 'text-gray-600',
};

export interface CellProps {
  readonly cell: CellType;
  readonly disabled: boolean;
  readonly onReveal: (row: number, col: number) => void;
  readonly onFlag: (row: number, col: number) => void;
}

function CellComponent({ cell, disabled, onReveal, onFlag }: CellProps) {
  const handleClick = () => {
    if (!disabled) {
      onReveal(cell.row, cell.col);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!disabled) {
      onFlag(cell.row, cell.col);
    }
  };

  const baseClass =
    'flex h-7 w-7 select-none items-center justify-center text-sm font-bold border border-slate-300 transition-colors';

  const dataAttrs = {
    'data-row': cell.row,
    'data-col': cell.col,
    'data-testid': `cell-${cell.row}-${cell.col}`,
  };

  if (!cell.isRevealed) {
    return (
      <button
        type="button"
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        disabled={disabled}
        aria-label={cell.isFlagged ? 'Célula com bandeira' : 'Célula oculta'}
        {...dataAttrs}
        className={cn(
          baseClass,
          'bg-slate-300 hover:bg-slate-200 active:bg-slate-100',
          disabled && 'cursor-not-allowed',
        )}
      >
        {cell.isFlagged ? <Flag className="h-3.5 w-3.5 text-red-600" /> : null}
      </button>
    );
  }

  if (cell.isMine) {
    return (
      <div
        {...dataAttrs}
        className={cn(
          baseClass,
          cell.isExploded ? 'bg-red-500' : 'bg-slate-100',
        )}
        aria-label="Mina"
      >
        💣
      </div>
    );
  }

  return (
    <div
      {...dataAttrs}
      className={cn(
        baseClass,
        'bg-slate-100',
        ADJACENT_COLORS[cell.adjacentMines] ?? 'text-transparent',
      )}
      aria-label={`${cell.adjacentMines} minas adjacentes`}
    >
      {cell.adjacentMines > 0 ? cell.adjacentMines : ''}
    </div>
  );
}

export const Cell = memo(CellComponent);
