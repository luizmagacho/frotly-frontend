import { test, expect } from '@playwright/test';

// Credentials are injected via environment variables — NEVER hardcode them here.
// Set E2E_USER_EMAIL and E2E_USER_PASSWORD in your .env.local or CI secrets.
const E2E_EMAIL = process.env.E2E_USER_EMAIL ?? '';
const E2E_PASSWORD = process.env.E2E_USER_PASSWORD ?? '';

test.describe('Login Flow', () => {
  test('should login successfully and redirect to dashboard', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Entrar')).toBeVisible();

    await page.fill('input[id="email"]', E2E_EMAIL);
    await page.fill('input[id="password"]', E2E_PASSWORD);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText('Visão Geral da Frota')).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[id="email"]', E2E_EMAIL);
    await page.fill('input[id="password"]', 'WrongPassword_invalid_for_testing_only!');
    await page.click('button[type="submit"]');

    const errorText = page.getByText(/Credenciais inválidas|Error/i);
    await expect(errorText).toBeVisible({ timeout: 5000 }).catch(() => {
      expect(page.url()).toContain('error');
    });
  });
});
