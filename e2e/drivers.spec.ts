import { test, expect } from '@playwright/test';

test.describe('Driver Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[id="email"]', 'contato@rogercentroautomotivo.com.br');
    await page.fill('input[id="password"]', 'Roger@123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should validate input masks and trigger custom error toasts on invalid sizes', async ({ page }) => {
    await page.goto('/motoristas/novo');

    // Fill form with invalid lengths
    await page.getByLabel('Nome Completo *').fill('A'); // Name < 2
    await page.getByLabel('CPF *').fill('123'); // CPF < 11
    await page.getByLabel('Telefone *').fill('119999'); // Phone < 10
    await page.getByLabel('E-mail *').fill('test@test.com');
    await page.getByLabel('Número da CNH *').fill('12345'); // CNH < 9
    await page.getByLabel('Categoria *').fill('B');
    await page.getByLabel('Validade *').fill('2028-12-31');

    await page.click('button[type="submit"]');

    // Expect custom toast: "O Nome deve ter pelo menos 2 caracteres."
    await expect(page.getByText('O Nome deve ter pelo menos 2 caracteres.')).toBeVisible();

    // Fix name, check CPF error
    await page.getByLabel('Nome Completo *').fill('João Silva');
    await page.click('button[type="submit"]');
    await expect(page.getByText('O CPF deve ter exatos 11 dígitos.')).toBeVisible();

    // Fix CPF, check CNH error
    await page.getByLabel('CPF *').fill('12345678901'); // Mask will format to 123.456.789-01
    await page.click('button[type="submit"]');
    await expect(page.getByText('O número da CNH deve ter entre 9 e 11 dígitos.')).toBeVisible();

    // Fix CNH, check Phone error
    await page.getByLabel('Número da CNH *').fill('12345678901');
    await page.click('button[type="submit"]');
    await expect(page.getByText('O telefone deve ter pelo menos 10 dígitos (com DDD).')).toBeVisible();
  });

  test('should successfully create a driver and avoid Bad Request', async ({ page }) => {
    await page.goto('/motoristas/novo');

    const randomCpf = Math.floor(10000000000 + Math.random() * 90000000000).toString();

    await page.getByLabel('Nome Completo *').fill('Motorista Teste E2E');
    await page.getByLabel('CPF *').fill(randomCpf); // 11 digits
    await page.getByLabel('RG').fill('123456789');
    await page.getByLabel('Telefone *').fill('11999999999');
    await page.getByLabel('E-mail *').fill(`driver_${Date.now()}@test.com`);
    
    await page.getByLabel('Número da CNH *').fill('12345678901');
    await page.getByLabel('Categoria *').fill('AB');
    await page.getByLabel('Validade *').fill('2028-12-31');

    await page.getByLabel('CEP').fill('01001000');
    await page.getByLabel('Cidade').fill('São Paulo');
    await page.getByLabel('Endereço Completo').fill('Praça da Sé');

    await page.click('button[type="submit"]');

    // Wait for success toast and redirection (no BadRequestException)
    await expect(page.getByText('Motorista cadastrado!')).toBeVisible();
    await expect(page).toHaveURL(/\/motoristas/);
  });
});
