export type BoardSize = '9x9' | '16x16' | '30x16';

export interface Cell {
  readonly row: number;
  readonly col: number;
  readonly isMine: boolean;
  readonly adjacentMines: number;
  readonly isRevealed: boolean;
  readonly isFlagged: boolean;
  readonly isExploded: boolean;
}

export type Board = ReadonlyArray<ReadonlyArray<Cell>>;

export type GameStatus = 'idle' | 'playing' | 'won' | 'lost';

export interface GameState {
  readonly board: Board;
  readonly status: GameStatus;
  readonly minesTotal: number;
  readonly flagsPlaced: number;
  readonly difficulty: BoardSize;
  readonly startedAt: number | null;
  readonly endedAt: number | null;
}
