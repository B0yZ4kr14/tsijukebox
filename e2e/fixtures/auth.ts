import { test as base, Page } from '@playwright/test';

/**
 * Fixture de autenticação para testes E2E
 * 
 * Fornece páginas pré-autenticadas para diferentes tipos de usuários.
 * 
 * Uso:
 * ```typescript
 * import { test } from './fixtures/auth';
 * 
 * test('should access dashboard', async ({ authenticatedPage }) => {
 *   await authenticatedPage.goto('/dashboard');
 *   // Usuário já está logado
 * });
 * ```
 */

// Credenciais de teste
const TEST_USERS = {
  admin: {
    email: 'admin@tsijukebox.local',
    password: 'admin123',
    role: 'admin',
  },
  user: {
    email: 'user@tsijukebox.local',
    password: 'user123',
    role: 'user',
  },
  guest: {
    email: 'guest@tsijukebox.local',
    password: 'guest123',
    role: 'guest',
  },
};

/**
 * Helper para fazer login
 */
async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  
  // Preencher formulário
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  
  // Submeter
  await page.getByRole('button', { name: 'Login' }).click();
  
  // Aguardar redirecionamento
  await page.waitForURL('/dashboard', { timeout: 10000 });
}

/**
 * Fixture estendida com autenticação
 */
export const test = base.extend<{
  authenticatedPage: Page;
  adminPage: Page;
  userPage: Page;
  guestPage: Page;
}>({
  /**
   * Página autenticada como usuário padrão
   */
  authenticatedPage: async ({ page }, use) => {
    await login(page, TEST_USERS.user.email, TEST_USERS.user.password);
    await use(page);
  },
  
  /**
   * Página autenticada como admin
   */
  adminPage: async ({ page }, use) => {
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    await use(page);
  },
  
  /**
   * Página autenticada como usuário normal
   */
  userPage: async ({ page }, use) => {
    await login(page, TEST_USERS.user.email, TEST_USERS.user.password);
    await use(page);
  },
  
  /**
   * Página autenticada como guest
   */
  guestPage: async ({ page }, use) => {
    await login(page, TEST_USERS.guest.email, TEST_USERS.guest.password);
    await use(page);
  },
});

export { expect } from '@playwright/test';
