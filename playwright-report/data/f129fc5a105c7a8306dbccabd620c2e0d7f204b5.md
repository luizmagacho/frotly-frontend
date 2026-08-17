# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: vehicles.spec.ts >> Vehicle Regression Tests >> should successfully create a vehicle and avoid Bad Request
- Location: e2e/vehicles.spec.ts:59:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/dashboard/
Received string:  "http://localhost:3100/login"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    14 × locator resolved to <html lang="pt-BR" class="light">…</html>
       - unexpected value "http://localhost:3100/login"

```

```yaml
- img "Roger Centro Automotivo"
- heading "Gestor de Frota" [level=1]
- paragraph: Controle e precisão para sua oficina
- text: Email ou senha inválidos Email
- textbox "Email":
  - /placeholder: seu@email.com
  - text: contato@rogercentroautomotivo.com.br
- text: Senha
- textbox "Senha":
  - /placeholder: ••••••••
  - text: Roger@123!
- button:
  - img
- link "Esqueceu a senha?":
  - /url: /esqueci-senha
- button "Entrar"
- paragraph:
  - text: Não tem conta?
  - link "Criar conta":
    - /url: /registro
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Vehicle Regression Tests', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Login
  6  |     await page.goto('/login');
  7  |     await page.fill('input[id="email"]', 'contato@rogercentroautomotivo.com.br');
  8  |     await page.fill('input[id="password"]', 'Roger@123!');
  9  |     await page.click('button[type="submit"]');
> 10 |     await expect(page).toHaveURL(/\/dashboard/);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  11 |   });
  12 | 
  13 |   test('should validate input masks and trigger custom error toasts on invalid sizes', async ({ page }) => {
  14 |     await page.goto('/veiculos/novo');
  15 | 
  16 |     // Fill form with invalid lengths
  17 |     await page.getByLabel('Placa *').fill('ABC12'); // Plate < 7
  18 |     await page.getByLabel('RENAVAM *').fill('12345'); // Renavam < 9
  19 |     await page.getByLabel('Chassi *').fill('1234567890'); // Chassi < 17
  20 |     
  21 |     // Fill other required fields so HTML5 validation passes and our custom logic runs
  22 |     await page.getByLabel('Marca *').fill('Toyota');
  23 |     await page.getByLabel('Modelo *').fill('Corolla');
  24 |     await page.getByLabel('Ano Fabricação *').fill('2022');
  25 |     await page.getByLabel('Ano Modelo *').fill('2023');
  26 |     await page.getByLabel('Cor *').fill('Preto');
  27 |     await page.getByLabel('Quilometragem Atual (km) *').fill('15000');
  28 |     await page.getByLabel('Valor de Compra (R$)').fill('12000000'); // 120k
  29 | 
  30 |     // Submit
  31 |     await page.click('button[type="submit"]');
  32 | 
  33 |     // Expect custom toast: "A Placa deve ter pelo menos 7 caracteres."
  34 |     await expect(page.getByText('A Placa deve ter pelo menos 7 caracteres.')).toBeVisible();
  35 | 
  36 |     // Fix plate, then check Renavam error
  37 |     await page.getByLabel('Placa *').fill('ABC1D23');
  38 |     await page.click('button[type="submit"]');
  39 |     await expect(page.getByText('O RENAVAM deve ter entre 9 e 11 dígitos.')).toBeVisible();
  40 | 
  41 |     // Fix Renavam, check Chassi error
  42 |     await page.getByLabel('RENAVAM *').fill('12345678901');
  43 |     await page.click('button[type="submit"]');
  44 |     await expect(page.getByText('O Chassi deve ter exatamente 17 caracteres.')).toBeVisible();
  45 |   });
  46 | 
  47 |   test('should apply currency and mileage masks correctly', async ({ page }) => {
  48 |     await page.goto('/veiculos/novo');
  49 |     
  50 |     const valorCompra = page.getByLabel('Valor de Compra (R$)');
  51 |     await valorCompra.fill('150000'); // Types 150000 (R$ 1.500,00)
  52 |     await expect(valorCompra).toHaveValue(/R\$\s?1\.500,00/);
  53 | 
  54 |     const km = page.getByLabel('Quilometragem Atual (km) *');
  55 |     await km.fill('15000');
  56 |     await expect(km).toHaveValue('15.000');
  57 |   });
  58 | 
  59 |   test('should successfully create a vehicle and avoid Bad Request', async ({ page }) => {
  60 |     await page.goto('/veiculos/novo');
  61 | 
  62 |     await page.getByLabel('Placa *').fill('XYX9A99'); 
  63 |     await page.getByLabel('RENAVAM *').fill('99988877766'); 
  64 |     await page.getByLabel('Chassi *').fill('9BWZZZ37Z9T000001'); // 17 chars
  65 |     
  66 |     await page.getByLabel('Marca *').fill('Volkswagen');
  67 |     await page.getByLabel('Modelo *').fill('Gol');
  68 |     await page.getByLabel('Ano Fabricação *').fill('2020');
  69 |     await page.getByLabel('Ano Modelo *').fill('2021');
  70 |     await page.getByLabel('Cor *').fill('Branco');
  71 |     await page.getByLabel('Quilometragem Atual (km) *').fill('50000');
  72 | 
  73 |     await page.click('button[type="submit"]');
  74 | 
  75 |     // Wait for success toast and redirection
  76 |     await expect(page.getByText('Veículo cadastrado com sucesso!')).toBeVisible();
  77 |     await expect(page).toHaveURL(/\/veiculos/);
  78 |   });
  79 | });
  80 | 
```