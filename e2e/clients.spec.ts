import { test, expect } from '@playwright/test';

const E2E_EMAIL = process.env.E2E_USER_EMAIL ?? '';
const E2E_PASSWORD = process.env.E2E_USER_PASSWORD ?? '';

test.describe('Clients UI Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[id="email"]', E2E_EMAIL);
    await page.fill('input[id="password"]', E2E_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should display clients table with proper light/dark mode contrast classes', async ({ page }) => {
    await page.goto('/clientes');
    await expect(page.getByText('Clientes', { exact: true })).toBeVisible();

    const container = page.locator('.bg-white.dark\\:bg-slate-900\\/50').first();
    await expect(container).toBeVisible();

    const headers = page.locator('th');
    const headerCount = await headers.count();
    if (headerCount > 0) {
      const classAttr = await headers.first().getAttribute('class');
      expect(classAttr).toContain('dark:text-slate-400');
    }
  });
});
