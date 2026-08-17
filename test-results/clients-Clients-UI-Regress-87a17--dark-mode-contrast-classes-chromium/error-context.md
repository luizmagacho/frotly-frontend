# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: clients.spec.ts >> Clients UI Regression Tests >> should display clients table with proper light/dark mode contrast classes
- Location: e2e/clients.spec.ts:12:7

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
  3  | test.describe('Clients UI Regression Tests', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/login');
  6  |     await page.fill('input[id="email"]', 'contato@rogercentroautomotivo.com.br');
  7  |     await page.fill('input[id="password"]', 'Roger@123!');
  8  |     await page.click('button[type="submit"]');
> 9  |     await expect(page).toHaveURL(/\/dashboard/);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  10 |   });
  11 | 
  12 |   test('should display clients table with proper light/dark mode contrast classes', async ({ page }) => {
  13 |     await page.goto('/clientes');
  14 | 
  15 |     // Wait for the page title to load
  16 |     await expect(page.getByText('Clientes', { exact: true })).toBeVisible();
  17 | 
  18 |     // Check if the table container has the correct tailwind classes for light and dark mode
  19 |     const container = page.locator('.bg-white.dark\\:bg-slate-900\\/50').first();
  20 |     await expect(container).toBeVisible();
  21 | 
  22 |     // Check if table headers have the readable text class for dark mode (dark:text-slate-400)
  23 |     // Find at least one header element
  24 |     const headers = page.locator('th');
  25 |     const headerCount = await headers.count();
  26 |     if (headerCount > 0) {
  27 |       const classAttr = await headers.first().getAttribute('class');
  28 |       expect(classAttr).toContain('dark:text-slate-400');
  29 |     }
  30 |   });
  31 | });
  32 | 
```