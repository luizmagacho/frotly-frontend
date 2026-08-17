# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: drivers.spec.ts >> Driver Regression Tests >> should successfully create a driver and avoid Bad Request
- Location: e2e/drivers.spec.ts:45:7

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
  3  | test.describe('Driver Regression Tests', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/login');
  6  |     await page.fill('input[id="email"]', 'contato@rogercentroautomotivo.com.br');
  7  |     await page.fill('input[id="password"]', 'Roger@123!');
  8  |     await page.click('button[type="submit"]');
> 9  |     await expect(page).toHaveURL(/\/dashboard/);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  10 |   });
  11 | 
  12 |   test('should validate input masks and trigger custom error toasts on invalid sizes', async ({ page }) => {
  13 |     await page.goto('/motoristas/novo');
  14 | 
  15 |     // Fill form with invalid lengths
  16 |     await page.getByLabel('Nome Completo *').fill('A'); // Name < 2
  17 |     await page.getByLabel('CPF *').fill('123'); // CPF < 11
  18 |     await page.getByLabel('Telefone *').fill('119999'); // Phone < 10
  19 |     await page.getByLabel('E-mail *').fill('test@test.com');
  20 |     await page.getByLabel('Número da CNH *').fill('12345'); // CNH < 9
  21 |     await page.getByLabel('Categoria *').fill('B');
  22 |     await page.getByLabel('Validade *').fill('2028-12-31');
  23 | 
  24 |     await page.click('button[type="submit"]');
  25 | 
  26 |     // Expect custom toast: "O Nome deve ter pelo menos 2 caracteres."
  27 |     await expect(page.getByText('O Nome deve ter pelo menos 2 caracteres.')).toBeVisible();
  28 | 
  29 |     // Fix name, check CPF error
  30 |     await page.getByLabel('Nome Completo *').fill('João Silva');
  31 |     await page.click('button[type="submit"]');
  32 |     await expect(page.getByText('O CPF deve ter exatos 11 dígitos.')).toBeVisible();
  33 | 
  34 |     // Fix CPF, check CNH error
  35 |     await page.getByLabel('CPF *').fill('12345678901'); // Mask will format to 123.456.789-01
  36 |     await page.click('button[type="submit"]');
  37 |     await expect(page.getByText('O número da CNH deve ter entre 9 e 11 dígitos.')).toBeVisible();
  38 | 
  39 |     // Fix CNH, check Phone error
  40 |     await page.getByLabel('Número da CNH *').fill('12345678901');
  41 |     await page.click('button[type="submit"]');
  42 |     await expect(page.getByText('O telefone deve ter pelo menos 10 dígitos (com DDD).')).toBeVisible();
  43 |   });
  44 | 
  45 |   test('should successfully create a driver and avoid Bad Request', async ({ page }) => {
  46 |     await page.goto('/motoristas/novo');
  47 | 
  48 |     const randomCpf = Math.floor(10000000000 + Math.random() * 90000000000).toString();
  49 | 
  50 |     await page.getByLabel('Nome Completo *').fill('Motorista Teste E2E');
  51 |     await page.getByLabel('CPF *').fill(randomCpf); // 11 digits
  52 |     await page.getByLabel('RG').fill('123456789');
  53 |     await page.getByLabel('Telefone *').fill('11999999999');
  54 |     await page.getByLabel('E-mail *').fill(`driver_${Date.now()}@test.com`);
  55 |     
  56 |     await page.getByLabel('Número da CNH *').fill('12345678901');
  57 |     await page.getByLabel('Categoria *').fill('AB');
  58 |     await page.getByLabel('Validade *').fill('2028-12-31');
  59 | 
  60 |     await page.getByLabel('CEP').fill('01001000');
  61 |     await page.getByLabel('Cidade').fill('São Paulo');
  62 |     await page.getByLabel('Endereço Completo').fill('Praça da Sé');
  63 | 
  64 |     await page.click('button[type="submit"]');
  65 | 
  66 |     // Wait for success toast and redirection (no BadRequestException)
  67 |     await expect(page.getByText('Motorista cadastrado!')).toBeVisible();
  68 |     await expect(page).toHaveURL(/\/motoristas/);
  69 |   });
  70 | });
  71 | 
```