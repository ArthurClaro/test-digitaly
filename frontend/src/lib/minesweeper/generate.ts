import type { Board, BoardSize, Cell } from './types';
import { DIFFICULTIES } from './config';

const NEIGHBOR_OFFSETS: ReadonlyArray<readonly [number, number]> = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
];

function createEmptyCell(row: number, col: number): Cell {
  return {
    row,
    col,
    isMine: false,
    adjacentMines: 0,
    isRevealed: false,
    isFlagged: false,
    isExploded: false,
  };
}

export function createEmptyBoard(difficulty: BoardSize): Board {
  const { rows, cols } = DIFFICULTIES[difficulty];
  const board: Cell[][] = [];
  for (let r = 0; r < rows; r += 1) {
    const row: Cell[] = [];
    for (let c = 0; c < cols; c += 1) {
      row.push(createEmptyCell(r, c));
    }
    board.push(row);
  }
  return board;
}

function buildExclusionSet(
  rows: number,
  cols: number,
  firstRow: number,
  firstCol: number,
): Set<number> {
  const excluded = new Set<number>();
  for (const [dr, dc] of NEIGHBOR_OFFSETS) {
    const r = firstRow + dr;
    const c = firstCol + dc;
    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      excluded.add(r * cols + c);
    }
  }
  excluded.add(firstRow * cols + firstCol);
  return excluded;
}

function placeMines(
  rows: number,
  cols: number,
  mines: number,
  exclude: Set<number>,
): Set<number> {
  const totalCells = rows * cols;
  const availableCount = totalCells - exclude.size;
  const minesToPlace = Math.min(mines, availableCount);

  const positions = new Set<number>();
  while (positions.size < minesToPlace) {
    const index = Math.floor(Math.random() * totalCells);
    if (!exclude.has(index) && !positions.has(index)) {
      positions.add(index);
    }
  }
  return positions;
}

function countAdjacentMines(
  mineSet: Set<number>,
  rows: number,
  cols: number,
  row: number,
  col: number,
): number {
  let count = 0;
  for (const [dr, dc] of NEIGHBOR_OFFSETS) {
    const r = row + dr;
    const c = col + dc;
    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      if (mineSet.has(r * cols + c)) {
        count += 1;
      }
    }
  }
  return count;
}

export function generateBoard(
  difficulty: BoardSize,
  firstClickRow: number,
  firstClickCol: number,
): Board {
  const { rows, cols, mines } = DIFFICULTIES[difficulty];
  const excluded = buildExclusionSet(rows, cols, firstClickRow, firstClickCol);
  const mineSet = placeMines(rows, cols, mines, excluded);

  const board: Cell[][] = [];
  for (let r = 0; r < rows; r += 1) {
    const row: Cell[] = [];
    for (let c = 0; c < cols; c += 1) {
      const index = r * cols + c;
      const isMine = mineSet.has(index);
      row.push({
        row: r,
        col: c,
        isMine,
        adjacentMines: isMine ? 0 : countAdjacentMines(mineSet, rows, cols, r, c),
        isRevealed: false,
        isFlagged: false,
        isExploded: false,
      });
    }
    board.push(row);
  }
  return board;
}
