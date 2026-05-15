import type { BoardSize } from './types';

export interface DifficultyConfig {
  readonly size: BoardSize;
  readonly rows: number;
  readonly cols: number;
  readonly mines: number;
  readonly label: string;
}

export const DIFFICULTIES: Readonly<Record<BoardSize, DifficultyConfig>> = {
  '9x9': { size: '9x9', rows: 9, cols: 9, mines: 10, label: 'Fácil (9x9)' },
  '16x16': { size: '16x16', rows: 16, cols: 16, mines: 40, label: 'Médio (16x16)' },
  '30x16': { size: '30x16', rows: 16, cols: 30, mines: 99, label: 'Difícil (30x16)' },
};

export const BOARD_SIZES: ReadonlyArray<BoardSize> = ['9x9', '16x16', '30x16'];

export const DEFAULT_DIFFICULTY: BoardSize = '9x9';
