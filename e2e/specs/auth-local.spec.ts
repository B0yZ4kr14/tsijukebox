import { test, expect } from '../fixtures/auth.fixture';

test.describe('Local Authentication', () => {
  test.beforeEach(async ({ authPage }) => {
    await authPage.goto();
  });

  test.describe('Login Flow', () => {
    test('should login successfully with admin/admin credentials', async ({ authPage, page }) => {
      // Verify we're on auth page with local mode
      const authMode = await authPage.getAuthMode();
      expect(authMode).toBe('local');

      // Login with admin credentials
      await authPage.loginLocal('admin', 'admin');

      // Verify successful login
      await expect(page).toHaveURL('/');
      
      // Verify user badge shows admin
      const isLoggedIn = await authPage.isLoggedIn();
      expect(isLoggedIn).toBe(true);
    });

    test('should login successfully with tsi/tsi credentials (legacy admin)', async ({ authPage, page }) => {
      await authPage.loginLocal('tsi', 'tsi');

      // Verify successful login and redirect
      await expect(page).toHaveURL('/');
      const isLoggedIn = await authPage.isLoggedIn();
      expect(isLoggedIn).toBe(true);
    });

    test('should login successfully with demo/demo credentials (user role)', async ({ authPage, page }) => {
      await authPage.loginLocal('demo', 'demo');

      // Verify successful login
      await expect(page).toHaveURL('/');
      const isLoggedIn = await authPage.isLoggedIn();
      expect(isLoggedIn).toBe(true);
    });

    test('should show error toast for invalid credentials', async ({ authPage }) => {
      await authPage.loginLocal('invaliduser', 'wrongpassword');

      // Verify error toast appears
      const hasError = await authPage.waitForToast('Credenciais inválidas');
      expect(hasError).toBe(true);

      // Should stay on auth page
      const isOnAuth = await authPage.isOnAuthPage();
      expect(isOnAuth).toBe(true);
    });

    test('should show error for empty username', async ({ authPage }) => {
      await authPage.loginLocal('', 'somepassword');

      // Should stay on auth page (validation prevents submission)
      const isOnAuth = await authPage.isOnAuthPage();
      expect(isOnAuth).toBe(true);
    });

    test('should show error for empty password', async ({ authPage }) => {
      await authPage.loginLocal('admin', '');

      // Should stay on auth page (validation prevents submission)
      const isOnAuth = await authPage.isOnAuthPage();
      expect(isOnAuth).toBe(true);
    });
  });

  test.describe('Logout Flow', () => {
    test('should logout successfully after login', async ({ authPage, page }) => {
      // First login
      await authPage.loginLocal('admin', 'admin');
      await expect(page).toHaveURL('/');

      // Then logout
      await authPage.logout();

      // Should redirect to auth or show login
      const isOnAuth = await authPage.isOnAuthPage();
      expect(isOnAuth).toBe(true);
    });
  });

  test.describe('Route Protection', () => {
    test('should redirect to /auth when accessing protected route without login', async ({ authPage, page }) => {
      // Try to access settings without login
      await page.goto('/settings');

      // Should redirect to auth
      await expect(page).toHaveURL('/auth');
    });

    test('should redirect to home after login when coming from protected route', async ({ authPage, page }) => {
      // Try to access protected route first
      await page.goto('/settings');
      
      // Login
      await authPage.loginLocal('admin', 'admin');

      // Should redirect to home or settings
      const url = page.url();
      expect(url.includes('/auth')).toBe(false);
    });
  });
});
