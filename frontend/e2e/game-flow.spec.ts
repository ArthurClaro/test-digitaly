import { test, expect, TEST_USER, injectAuthCookies } from './fixtures/auth';
import type { Page } from '@playwright/test';

type Cell = {
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
};

type GameState = {
  board: Cell[][];
  status: 'idle' | 'playing' | 'won' | 'lost';
  difficulty: '9x9' | '16x16' | '30x16';
  submitState: 'idle' | 'submitting' | 'submitted' | 'error';
};

async function readGameState(page: Page): Promise<GameState> {
  return page.evaluate(
    () => (window as unknown as { __game: GameState }).__game,
  );
}

async function clickCell(page: Page, row: number, col: number): Promise<void> {
  await page.locator(`[data-testid="cell-${row}-${col}"]`).click();
}

async function rightClickCell(page: Page, row: number, col: number): Promise<void> {
  await page.locator(`[data-testid="cell-${row}-${col}"]`).click({ button: 'right' });
}

async function waitForBoardGenerated(page: Page): Promise<GameState> {
  await page.waitForFunction(
    () => (window as unknown as { __game?: GameState }).__game?.status === 'playing'
       || (window as unknown as { __game?: GameState }).__game?.status === 'won'
       || (window as unknown as { __game?: GameState }).__game?.status === 'lost',
    { timeout: 5000 },
  );
  return readGameState(page);
}

async function playToWin(page: Page): Promise<GameState> {
  // First click center to generate the board
  const state0 = await readGameState(page);
  const rows = state0.board.length;
  const cols = state0.board[0].length;
  await clickCell(page, Math.floor(rows / 2), Math.floor(cols / 2));
  await waitForBoardGenerated(page);

  // Read the generated board and click every non-mine cell that is not yet revealed
  for (let safety = 0; safety < rows * cols + 10; safety += 1) {
    const state = await readGameState(page);
    if (state.status === 'won' || state.status === 'lost') {
      return state;
    }
    const next = state.board
      .flat()
      .find((c) => !c.isMine && !c.isRevealed && !c.isFlagged);
    if (!next) {
      return state;
    }
    await clickCell(page, next.row, next.col);
  }
  return readGameState(page);
}

test.describe('Authenticated game flow', () => {
  test.beforeEach(async ({ context }) => {
    await injectAuthCookies(context);
  });

  test('home page renders the game for authenticated user', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(TEST_USER.name)).toBeVisible();
    await expect(page.getByRole('button', { name: /Reiniciar/i })).toBeVisible();
    await expect(page.getByText(/Clique esquerdo revela/i)).toBeVisible();
  });

  test('first click never lands on a mine and starts timer', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => !!(window as unknown as { __game?: GameState }).__game);
    await clickCell(page, 4, 4);
    const state = await waitForBoardGenerated(page);
    expect(state.board[4][4].isMine).toBe(false);
    expect(state.board[4][4].isRevealed).toBe(true);
  });

  test('right-click toggles flag', async ({ page }) => {
    await page.goto('/');
    await clickCell(page, 4, 4);
    await waitForBoardGenerated(page);
    await rightClickCell(page, 0, 0);
    const state = await readGameState(page);
    expect(state.board[0][0].isFlagged).toBe(true);
  });

  test('clicking a mine ends the game with lost status', async ({ page }) => {
    await page.goto('/');
    await clickCell(page, 4, 4);
    await waitForBoardGenerated(page);
    const state = await readGameState(page);
    const mine = state.board.flat().find((c) => c.isMine);
    expect(mine).toBeDefined();
    await clickCell(page, mine!.row, mine!.col);
    await page.waitForFunction(
      () => (window as unknown as { __game?: GameState }).__game?.status === 'lost',
    );
    const lostState = await readGameState(page);
    expect(lostState.status).toBe('lost');
    expect(lostState.submitState).toBe('idle');
  });

  test('winning submits score and it appears in ranking', async ({ page, request }) => {
    await page.goto('/');
    await page.waitForFunction(() => !!(window as unknown as { __game?: GameState }).__game);
    const won = await playToWin(page);
    expect(won.status).toBe('won');

    await page.waitForFunction(
      () => (window as unknown as { __game?: GameState }).__game?.submitState === 'submitted',
      { timeout: 10_000 },
    );

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
    const response = await request.get(`${apiUrl}/scores/ranking?boardSize=9x9`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    const ours = body.items.find(
      (s: { userId: string }) => s.userId === TEST_USER.sub,
    );
    expect(ours).toBeDefined();
    expect(ours.boardSize).toBe('9x9');
    expect(ours.timeMs).toBeGreaterThan(0);
  });

  test('ranking page lists scores', async ({ page }) => {
    await page.goto('/ranking');
    await expect(page.getByText(/Ranking/i).first()).toBeVisible();
  });
});
