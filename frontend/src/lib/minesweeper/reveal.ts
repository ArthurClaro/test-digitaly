import type { Board, Cell } from './types';

type MutableCell = {
  -readonly [K in keyof Cell]: Cell[K];
};

const NEIGHBOR_OFFSETS: ReadonlyArray<readonly [number, number]> = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
];

function cloneBoard(board: Board): MutableCell[][] {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

export function revealCell(board: Board, row: number, col: number): Board {
  const target = board[row]?.[col];
  if (!target || target.isRevealed || target.isFlagged) {
    return board;
  }

  const next = cloneBoard(board);

  if (target.isMine) {
    for (let r = 0; r < next.length; r += 1) {
      for (let c = 0; c < next[r].length; c += 1) {
        if (next[r][c].isMine) {
          next[r][c].isRevealed = true;
        }
      }
    }
    next[row][col].isExploded = true;
    return next;
  }

  const rows = next.length;
  const cols = next[0].length;
  const queue: Array<[number, number]> = [[row, col]];

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    const cell = next[r][c];
    if (cell.isRevealed || cell.isFlagged) {
      continue;
    }
    cell.isRevealed = true;

    if (cell.adjacentMines === 0 && !cell.isMine) {
      for (const [dr, dc] of NEIGHBOR_OFFSETS) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          const neighbor = next[nr][nc];
          if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isMine) {
            queue.push([nr, nc]);
          }
        }
      }
    }
  }

  return next;
}

export function toggleFlag(board: Board, row: number, col: number): Board {
  const target = board[row]?.[col];
  if (!target || target.isRevealed) {
    return board;
  }
  const next = cloneBoard(board);
  next[row][col].isFlagged = !next[row][col].isFlagged;
  return next;
}

export function checkWin(board: Board): boolean {
  for (const row of board) {
    for (const cell of row) {
      if (!cell.isMine && !cell.isRevealed) {
        return false;
      }
    }
  }
  return true;
}

export function hasExplodedMine(board: Board): boolean {
  for (const row of board) {
    for (const cell of row) {
      if (cell.isExploded) {
        return true;
      }
    }
  }
  return false;
}

export function countFlags(board: Board): number {
  let count = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell.isFlagged) {
        count += 1;
      }
    }
  }
  return count;
}
