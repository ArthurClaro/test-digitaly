import { test, expect } from '@playwright/test';

test.describe('Auth-protected routes (no session)', () => {
  test('/ redirects to /login', async ({ page }) => {
    const response = await page.goto('/');
    expect(page.url()).toContain('/login');
    expect(response?.status()).toBeLessThan(400);
  });

  test('/ranking redirects to /login', async ({ page }) => {
    await page.goto('/ranking');
    expect(page.url()).toContain('/login');
  });

  test('/login renders sign-in card with GitHub button', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Campo Minado').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Entrar com GitHub/i })).toBeVisible();
  });

  test('clicking GitHub button redirects to github.com OAuth', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /Entrar com GitHub/i }).click();
    await page.waitForURL(/github\.com/, { timeout: 15_000 });
    expect(page.url()).toMatch(/github\.com/);
  });
});
