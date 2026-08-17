import { test, expect } from '@playwright/test';

test.describe('Vehicle Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[id="email"]', 'contato@rogercentroautomotivo.com.br');
    await page.fill('input[id="password"]', 'Roger@123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should validate input masks and trigger custom error toasts on invalid sizes', async ({ page }) => {
    await page.goto('/veiculos/novo');

    // Fill form with invalid lengths
    await page.getByLabel('Placa *').fill('ABC12'); // Plate < 7
    await page.getByLabel('RENAVAM *').fill('12345'); // Renavam < 9
    await page.getByLabel('Chassi *').fill('1234567890'); // Chassi < 17
    
    // Fill other required fields so HTML5 validation passes and our custom logic runs
    await page.getByLabel('Marca *').fill('Toyota');
    await page.getByLabel('Modelo *').fill('Corolla');
    await page.getByLabel('Ano Fabricação *').fill('2022');
    await page.getByLabel('Ano Modelo *').fill('2023');
    await page.getByLabel('Cor *').fill('Preto');
    await page.getByLabel('Quilometragem Atual (km) *').fill('15000');
    await page.getByLabel('Valor de Compra (R$)').fill('12000000'); // 120k

    // Submit
    await page.click('button[type="submit"]');

    // Expect custom toast: "A Placa deve ter pelo menos 7 caracteres."
    await expect(page.getByText('A Placa deve ter pelo menos 7 caracteres.')).toBeVisible();

    // Fix plate, then check Renavam error
    await page.getByLabel('Placa *').fill('ABC1D23');
    await page.click('button[type="submit"]');
    await expect(page.getByText('O RENAVAM deve ter entre 9 e 11 dígitos.')).toBeVisible();

    // Fix Renavam, check Chassi error
    await page.getByLabel('RENAVAM *').fill('12345678901');
    await page.click('button[type="submit"]');
    await expect(page.getByText('O Chassi deve ter exatamente 17 caracteres.')).toBeVisible();
  });

  test('should apply currency and mileage masks correctly', async ({ page }) => {
    await page.goto('/veiculos/novo');
    
    const valorCompra = page.getByLabel('Valor de Compra (R$)');
    await valorCompra.fill('150000'); // Types 150000 (R$ 1.500,00)
    await expect(valorCompra).toHaveValue(/R\$\s?1\.500,00/);

    const km = page.getByLabel('Quilometragem Atual (km) *');
    await km.fill('15000');
    await expect(km).toHaveValue('15.000');
  });

  test('should successfully create a vehicle and avoid Bad Request', async ({ page }) => {
    await page.goto('/veiculos/novo');

    await page.getByLabel('Placa *').fill('XYX9A99'); 
    await page.getByLabel('RENAVAM *').fill('99988877766'); 
    await page.getByLabel('Chassi *').fill('9BWZZZ37Z9T000001'); // 17 chars
    
    await page.getByLabel('Marca *').fill('Volkswagen');
    await page.getByLabel('Modelo *').fill('Gol');
    await page.getByLabel('Ano Fabricação *').fill('2020');
    await page.getByLabel('Ano Modelo *').fill('2021');
    await page.getByLabel('Cor *').fill('Branco');
    await page.getByLabel('Quilometragem Atual (km) *').fill('50000');

    await page.click('button[type="submit"]');

    // Wait for success toast and redirection
    await expect(page.getByText('Veículo cadastrado com sucesso!')).toBeVisible();
    await expect(page).toHaveURL(/\/veiculos/);
  });
});
