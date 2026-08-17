# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.ts >> Login Flow >> should login successfully and redirect to dashboard
- Location: e2e/login.spec.ts:4:7

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
  3  | test.describe('Login Flow', () => {
  4  |   test('should login successfully and redirect to dashboard', async ({ page }) => {
  5  |     // Go to the login page
  6  |     await page.goto('/login');
  7  | 
  8  |     // Wait for page to load
  9  |     await expect(page.getByText('Entrar')).toBeVisible();
  10 | 
  11 |     // Fill in the login form (using the test credentials for the existing DB)
  12 |     await page.fill('input[id="email"]', 'contato@rogercentroautomotivo.com.br');
  13 |     await page.fill('input[id="password"]', 'Roger@123!');
  14 | 
  15 |     // Click the submit button
  16 |     await page.click('button[type="submit"]');
  17 | 
  18 |     // Expect the page to redirect to the dashboard
> 19 |     await expect(page).toHaveURL(/\/dashboard/);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  20 |     
  21 |     // Expect the dashboard title to be visible
  22 |     await expect(page.getByText('Visão Geral da Frota')).toBeVisible();
  23 |   });
  24 | 
  25 |   test('should show error on invalid credentials', async ({ page }) => {
  26 |     await page.goto('/login');
  27 |     
  28 |     await page.fill('input[id="email"]', 'contato@rogercentroautomotivo.com.br');
  29 |     await page.fill('input[id="password"]', 'WrongPassword123!');
  30 |     await page.click('button[type="submit"]');
  31 | 
  32 |     // NextAuth usually shows an error message or redirects with an error query param
  33 |     // Depending on the exact implementation, we check for a toast or error text
  34 |     const errorText = page.getByText(/Credenciais inválidas|Error/i);
  35 |     await expect(errorText).toBeVisible({ timeout: 5000 }).catch(() => {
  36 |       // If error text is not shown directly, check for URL error param
  37 |       expect(page.url()).toContain('error');
  38 |     });
  39 |   });
  40 | });
  41 | 
```