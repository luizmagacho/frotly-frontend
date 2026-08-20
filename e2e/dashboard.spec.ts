import { test, expect } from '@playwright/test';

const E2E_EMAIL = process.env.E2E_USER_EMAIL ?? '';
const E2E_PASSWORD = process.env.E2E_USER_PASSWORD ?? '';

test.describe('Dashboard Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[id="email"]', E2E_EMAIL);
    await page.fill('input[id="password"]', E2E_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  test('should display dashboard KPIs correctly without crashing', async ({ page }) => {
    await expect(page.getByText('Visão Geral da Frota')).toBeVisible();
    await expect(page.getByText('Total de Veículos')).toBeVisible();
    await expect(page.getByText('Veículos Alugados')).toBeVisible();
    await expect(page.getByText('Em Manutenção')).toBeVisible();
  });

  test('should be able to navigate to IPVA page without crashing (regression)', async ({ page }) => {
    await page.click('a[href="/ipva"]');
    await page.waitForURL(/\/ipva/);
    await expect(page.getByText('Gestão de IPVA')).toBeVisible();
  });
});
