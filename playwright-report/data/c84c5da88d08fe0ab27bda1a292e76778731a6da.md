# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> Dashboard Flow >> should be able to navigate to IPVA page without crashing (regression)
- Location: e2e/dashboard.spec.ts:24:7

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - img "Roger Centro Automotivo" [ref=e6]
      - heading "Gestor de Frota" [level=1] [ref=e7]
      - paragraph [ref=e8]: Controle e precisão para sua oficina
    - generic [ref=e9]:
      - generic [ref=e10]: Email ou senha inválidos
      - generic [ref=e11]:
        - generic [ref=e12]: Email
        - textbox "Email" [ref=e13]:
          - /placeholder: seu@email.com
          - text: contato@rogercentroautomotivo.com.br
      - generic [ref=e14]:
        - generic [ref=e15]: Senha
        - generic [ref=e16]:
          - textbox "Senha" [ref=e17]:
            - /placeholder: ••••••••
            - text: Roger@123!
          - button [ref=e18]
      - link "Esqueceu a senha?" [ref=e23] [cursor=pointer]:
        - /url: /esqueci-senha
      - button "Entrar" [ref=e24]
      - paragraph [ref=e25]:
        - text: Não tem conta?
        - link "Criar conta" [ref=e26] [cursor=pointer]:
          - /url: /registro
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e32] [cursor=pointer]
  - alert [ref=e36]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Dashboard Flow', () => {
  4  |   // Use a beforeEach hook to login before testing dashboard features
  5  |   test.beforeEach(async ({ page }) => {
  6  |     await page.goto('/login');
  7  |     await page.fill('input[id="email"]', 'contato@rogercentroautomotivo.com.br');
  8  |     await page.fill('input[id="password"]', 'Roger@123!');
  9  |     await page.click('button[type="submit"]');
> 10 |     await page.waitForURL(/\/dashboard/);
     |                ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
  11 |   });
  12 | 
  13 |   test('should display dashboard KPIs correctly without crashing', async ({ page }) => {
  14 |     // Assert the main title is visible
  15 |     await expect(page.getByText('Visão Geral da Frota')).toBeVisible();
  16 | 
  17 |     // Check if KPIs cards are rendered (they usually contain standard text or numbers)
  18 |     // Even if data is empty, the cards should not crash the page
  19 |     await expect(page.getByText('Total de Veículos')).toBeVisible();
  20 |     await expect(page.getByText('Veículos Alugados')).toBeVisible();
  21 |     await expect(page.getByText('Em Manutenção')).toBeVisible();
  22 |   });
  23 | 
  24 |   test('should be able to navigate to IPVA page without crashing (regression)', async ({ page }) => {
  25 |     // Click on the IPVA menu item (assuming there is a link with text IPVA)
  26 |     await page.click('a[href="/ipva"]');
  27 |     
  28 |     // Wait for URL to change
  29 |     await page.waitForURL(/\/ipva/);
  30 | 
  31 |     // Assert the IPVA page loaded
  32 |     await expect(page.getByText('Gestão de IPVA')).toBeVisible();
  33 |     
  34 |     // The previous bug would crash the entire page and show a white screen or React Error Boundary.
  35 |     // By checking if the header is visible, we guarantee the page rendered successfully.
  36 |   });
  37 | });
  38 | 
```