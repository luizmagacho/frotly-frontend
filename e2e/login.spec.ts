import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should login successfully and redirect to dashboard', async ({ page }) => {
    // Go to the login page
    await page.goto('/login');

    // Wait for page to load
    await expect(page.getByText('Entrar')).toBeVisible();

    // Fill in the login form (using the test credentials for the existing DB)
    await page.fill('input[id="email"]', 'contato@rogercentroautomotivo.com.br');
    await page.fill('input[id="password"]', 'Roger@123!');

    // Click the submit button
    await page.click('button[type="submit"]');

    // Expect the page to redirect to the dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Expect the dashboard title to be visible
    await expect(page.getByText('Visão Geral da Frota')).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[id="email"]', 'contato@rogercentroautomotivo.com.br');
    await page.fill('input[id="password"]', 'WrongPassword123!');
    await page.click('button[type="submit"]');

    // NextAuth usually shows an error message or redirects with an error query param
    // Depending on the exact implementation, we check for a toast or error text
    const errorText = page.getByText(/Credenciais inválidas|Error/i);
    await expect(errorText).toBeVisible({ timeout: 5000 }).catch(() => {
      // If error text is not shown directly, check for URL error param
      expect(page.url()).toContain('error');
    });
  });
});
