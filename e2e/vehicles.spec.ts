import { test, expect } from '@playwright/test';

const E2E_EMAIL = process.env.E2E_USER_EMAIL ?? '';
const E2E_PASSWORD = process.env.E2E_USER_PASSWORD ?? '';

test.describe('Vehicle Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[id="email"]', E2E_EMAIL);
    await page.fill('input[id="password"]', E2E_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should validate input masks and trigger custom error toasts on invalid sizes', async ({ page }) => {
    await page.goto('/veiculos/novo');

    await page.getByLabel('Placa *').fill('ABC12'); // Plate < 7
    await page.getByLabel('RENAVAM *').fill('12345'); // Renavam < 9
    await page.getByLabel('Chassi *').fill('1234567890'); // Chassi < 17

    await page.getByLabel('Marca *').fill('Toyota');
    await page.getByLabel('Modelo *').fill('Corolla');
    await page.getByLabel('Ano Fabricação *').fill('2022');
    await page.getByLabel('Ano Modelo *').fill('2023');
    await page.getByLabel('Cor *').fill('Preto');
    await page.getByLabel('Quilometragem Atual (km) *').fill('15000');
    await page.getByLabel('Valor de Compra (R$)').fill('12000000');

    await page.click('button[type="submit"]');
    await expect(page.getByText('A Placa deve ter pelo menos 7 caracteres.')).toBeVisible();

    await page.getByLabel('Placa *').fill('ABC1D23');
    await page.click('button[type="submit"]');
    await expect(page.getByText('O RENAVAM deve ter entre 9 e 11 dígitos.')).toBeVisible();

    await page.getByLabel('RENAVAM *').fill('12345678901');
    await page.click('button[type="submit"]');
    await expect(page.getByText('O Chassi deve ter exatamente 17 caracteres.')).toBeVisible();
  });

  test('should apply currency and mileage masks correctly', async ({ page }) => {
    await page.goto('/veiculos/novo');

    const valorCompra = page.getByLabel('Valor de Compra (R$)');
    await valorCompra.fill('150000');
    await expect(valorCompra).toHaveValue(/R\$\s?1\.500,00/);

    const km = page.getByLabel('Quilometragem Atual (km) *');
    await km.fill('15000');
    await expect(km).toHaveValue('15.000');
  });

  test('should successfully create a vehicle and avoid Bad Request', async ({ page }) => {
    await page.goto('/veiculos/novo');

    await page.getByLabel('Placa *').fill('XYX9A99');
    await page.getByLabel('RENAVAM *').fill('99988877766');
    await page.getByLabel('Chassi *').fill('9BWZZZ37Z9T000001');

    await page.getByLabel('Marca *').fill('Volkswagen');
    await page.getByLabel('Modelo *').fill('Gol');
    await page.getByLabel('Ano Fabricação *').fill('2020');
    await page.getByLabel('Ano Modelo *').fill('2021');
    await page.getByLabel('Cor *').fill('Branco');
    await page.getByLabel('Quilometragem Atual (km) *').fill('50000');

    await page.click('button[type="submit"]');

    await expect(page.getByText('Veículo cadastrado com sucesso!')).toBeVisible();
    await expect(page).toHaveURL(/\/veiculos/);
  });
});
