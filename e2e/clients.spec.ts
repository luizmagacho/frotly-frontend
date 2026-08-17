import { test, expect } from '@playwright/test';

test.describe('Clients UI Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[id="email"]', 'contato@rogercentroautomotivo.com.br');
    await page.fill('input[id="password"]', 'Roger@123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should display clients table with proper light/dark mode contrast classes', async ({ page }) => {
    await page.goto('/clientes');

    // Wait for the page title to load
    await expect(page.getByText('Clientes', { exact: true })).toBeVisible();

    // Check if the table container has the correct tailwind classes for light and dark mode
    const container = page.locator('.bg-white.dark\\:bg-slate-900\\/50').first();
    await expect(container).toBeVisible();

    // Check if table headers have the readable text class for dark mode (dark:text-slate-400)
    // Find at least one header element
    const headers = page.locator('th');
    const headerCount = await headers.count();
    if (headerCount > 0) {
      const classAttr = await headers.first().getAttribute('class');
      expect(classAttr).toContain('dark:text-slate-400');
    }
  });
});
