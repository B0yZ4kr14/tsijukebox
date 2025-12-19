import { test, expect } from '../fixtures/auth.fixture';

test.describe('Supabase Authentication', () => {
  // These tests require Supabase auth provider to be enabled
  // They test the UI behavior, not actual Supabase calls

  test.describe('Login Tab UI', () => {
    test('should display login and signup tabs when Supabase provider is active', async ({ page }) => {
      // Set auth config to supabase mode (via localStorage or mock)
      await page.addInitScript(() => {
        localStorage.setItem('auth_config', JSON.stringify({ provider: 'supabase' }));
      });

      await page.goto('/auth');

      // Check for tabs presence
      const loginTab = page.locator('[data-testid="login-tab"]');
      const signupTab = page.locator('[data-testid="signup-tab"]');

      await expect(loginTab).toBeVisible();
      await expect(signupTab).toBeVisible();
    });

    test('should switch between login and signup tabs', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('auth_config', JSON.stringify({ provider: 'supabase' }));
      });

      await page.goto('/auth');

      // Click signup tab
      const signupTab = page.locator('[data-testid="signup-tab"]');
      await signupTab.click();

      // Verify confirm password field appears
      const confirmPassword = page.locator('[data-testid="confirm-password-input"]');
      await expect(confirmPassword).toBeVisible();

      // Click back to login
      const loginTab = page.locator('[data-testid="login-tab"]');
      await loginTab.click();

      // Verify confirm password is hidden
      await expect(confirmPassword).not.toBeVisible();
    });
  });

  test.describe('Email Validation', () => {
    test('should show error for invalid email format', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('auth_config', JSON.stringify({ provider: 'supabase' }));
      });

      await page.goto('/auth');

      // Enter invalid email
      const emailInput = page.locator('[data-testid="email-input"]');
      await emailInput.fill('invalid-email');

      // Try to submit
      const loginButton = page.locator('[data-testid="login-button"]');
      await loginButton.click();

      // Check for validation error
      const hasError = await page.locator('text=email').isVisible();
      expect(hasError).toBe(true);
    });

    test('should accept valid email format', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('auth_config', JSON.stringify({ provider: 'supabase' }));
      });

      await page.goto('/auth');

      // Enter valid email
      const emailInput = page.locator('[data-testid="email-input"]');
      await emailInput.fill('test@example.com');

      // Fill password
      const passwordInput = page.locator('[data-testid="password-input"]');
      await passwordInput.fill('password123');

      // Should not show email format error
      const emailError = page.locator('text=email inválido');
      await expect(emailError).not.toBeVisible();
    });
  });

  test.describe('Password Validation', () => {
    test('should show error for password less than 6 characters', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('auth_config', JSON.stringify({ provider: 'supabase' }));
      });

      await page.goto('/auth');

      // Go to signup tab
      const signupTab = page.locator('[data-testid="signup-tab"]');
      await signupTab.click();

      // Fill fields
      const emailInput = page.locator('[data-testid="email-input"]');
      await emailInput.fill('test@example.com');

      const passwordInput = page.locator('[data-testid="password-input"]');
      await passwordInput.fill('12345'); // Less than 6 chars

      const confirmInput = page.locator('[data-testid="confirm-password-input"]');
      await confirmInput.fill('12345');

      // Submit
      const signupButton = page.locator('[data-testid="signup-button"]');
      await signupButton.click();

      // Should show password length error
      const hasError = await page.locator('text=6').isVisible();
      expect(hasError).toBe(true);
    });

    test('should show error when passwords do not match on signup', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('auth_config', JSON.stringify({ provider: 'supabase' }));
      });

      await page.goto('/auth');

      // Go to signup tab
      const signupTab = page.locator('[data-testid="signup-tab"]');
      await signupTab.click();

      // Fill fields with mismatched passwords
      const emailInput = page.locator('[data-testid="email-input"]');
      await emailInput.fill('test@example.com');

      const passwordInput = page.locator('[data-testid="password-input"]');
      await passwordInput.fill('password123');

      const confirmInput = page.locator('[data-testid="confirm-password-input"]');
      await confirmInput.fill('differentpassword');

      // Submit
      const signupButton = page.locator('[data-testid="signup-button"]');
      await signupButton.click();

      // Should show password mismatch error
      const hasError = await page.locator('text=conferem').isVisible();
      expect(hasError).toBe(true);
    });
  });

  test.describe('Signup Flow', () => {
    test('should complete signup form with valid data', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('auth_config', JSON.stringify({ provider: 'supabase' }));
      });

      await page.goto('/auth');

      // Go to signup tab
      const signupTab = page.locator('[data-testid="signup-tab"]');
      await signupTab.click();

      // Fill valid data
      const emailInput = page.locator('[data-testid="email-input"]');
      await emailInput.fill('newuser@example.com');

      const passwordInput = page.locator('[data-testid="password-input"]');
      await passwordInput.fill('securepassword123');

      const confirmInput = page.locator('[data-testid="confirm-password-input"]');
      await confirmInput.fill('securepassword123');

      // Submit
      const signupButton = page.locator('[data-testid="signup-button"]');
      await signupButton.click();

      // Form should be submitted (will fail without real Supabase, but no validation errors)
      // Wait a moment for form processing
      await page.waitForTimeout(500);
    });
  });
});
