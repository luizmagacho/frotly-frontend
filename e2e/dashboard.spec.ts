import { test, expect } from '@playwright/test';

test.describe('Dashboard Flow', () => {
  // Use a beforeEach hook to login before testing dashboard features
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'contato@rogercentroautomotivo.com.br');
    await page.fill('input[name="password"]', 'Roger@123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  test('should display dashboard KPIs correctly without crashing', async ({ page }) => {
    // Assert the main title is visible
    await expect(page.getByText('Visão Geral da Frota')).toBeVisible();

    // Check if KPIs cards are rendered (they usually contain standard text or numbers)
    // Even if data is empty, the cards should not crash the page
    await expect(page.getByText('Total de Veículos')).toBeVisible();
    await expect(page.getByText('Veículos Alugados')).toBeVisible();
    await expect(page.getByText('Em Manutenção')).toBeVisible();
  });

  test('should be able to navigate to IPVA page without crashing (regression)', async ({ page }) => {
    // Click on the IPVA menu item (assuming there is a link with text IPVA)
    await page.click('a[href="/ipva"]');
    
    // Wait for URL to change
    await page.waitForURL(/\/ipva/);

    // Assert the IPVA page loaded
    await expect(page.getByText('Gestão de IPVA')).toBeVisible();
    
    // The previous bug would crash the entire page and show a white screen or React Error Boundary.
    // By checking if the header is visible, we guarantee the page rendered successfully.
  });
});
