import { test as base, expect, type Page, type Locator } from '@playwright/test';

/**
 * Authentication Page Object Model for E2E Tests
 * Supports both Local and Supabase authentication modes
 */
export class AuthPage {
  readonly page: Page;
  
  // Common locators
  readonly authCard: Locator;
  readonly logoBrand: Locator;
  
  // Local Login locators
  readonly usernameInput: Locator;
  readonly localPasswordInput: Locator;
  readonly localLoginButton: Locator;
  
  // Supabase Login locators
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly loginTab: Locator;
  readonly signupTab: Locator;
  
  // Signup locators
  readonly confirmPasswordInput: Locator;
  readonly signupButton: Locator;
  
  // User badge / menu
  readonly userBadge: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Common
    this.authCard = page.locator('[data-testid="auth-card"]');
    this.logoBrand = page.locator('[data-testid="logo-brand"]');
    
    // Local Login
    this.usernameInput = page.locator('[data-testid="username-input"]');
    this.localPasswordInput = page.locator('[data-testid="local-password-input"]');
    this.localLoginButton = page.locator('[data-testid="local-login-button"]');
    
    // Supabase Login
    this.emailInput = page.locator('[data-testid="email-input"]');
    this.passwordInput = page.locator('[data-testid="password-input"]');
    this.loginButton = page.locator('[data-testid="login-button"]');
    this.loginTab = page.locator('[data-testid="login-tab"]');
    this.signupTab = page.locator('[data-testid="signup-tab"]');
    
    // Signup
    this.confirmPasswordInput = page.locator('[data-testid="confirm-password-input"]');
    this.signupButton = page.locator('[data-testid="signup-button"]');
    
    // User actions
    this.userBadge = page.locator('[data-testid="user-badge"]');
    this.logoutButton = page.locator('[data-testid="logout-button"]');
  }

  async goto() {
    await this.page.goto('/auth');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoHome() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoSettings() {
    await this.page.goto('/settings');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Login with local credentials (username/password)
   */
  async loginLocal(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.localPasswordInput.fill(password);
    await this.localLoginButton.click();
  }

  /**
   * Login with Supabase credentials (email/password)
   */
  async loginSupabase(email: string, password: string): Promise<void> {
    await this.loginTab.click();
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Sign up with Supabase (email/password)
   */
  async signup(email: string, password: string, confirmPassword?: string): Promise<void> {
    await this.signupTab.click();
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword || password);
    await this.signupButton.click();
  }

  /**
   * Logout from the application
   */
  async logout(): Promise<void> {
    await this.userBadge.click();
    await this.logoutButton.click();
  }

  /**
   * Check if user is logged in (on home page with user badge visible)
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      await this.page.waitForURL('/', { timeout: 3000 });
      return await this.userBadge.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Check if on auth page
   */
  async isOnAuthPage(): Promise<boolean> {
    return this.page.url().includes('/auth');
  }

  /**
   * Get current authentication mode from UI
   */
  async getAuthMode(): Promise<'local' | 'supabase'> {
    const hasUsernameField = await this.usernameInput.isVisible();
    return hasUsernameField ? 'local' : 'supabase';
  }

  /**
   * Get user role badge text
   */
  async getUserRole(): Promise<string> {
    const badge = this.page.locator('[data-testid="user-role-badge"]');
    return await badge.textContent() || '';
  }

  /**
   * Check if toast message appears
   */
  async waitForToast(message: string): Promise<boolean> {
    try {
      await this.page.locator(`text=${message}`).waitFor({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if a specific element is visible
   */
  async isElementVisible(testId: string): Promise<boolean> {
    return await this.page.locator(`[data-testid="${testId}"]`).isVisible();
  }
}

/**
 * Extended test fixture with AuthPage
 */
export const test = base.extend<{ authPage: AuthPage }>({
  authPage: async ({ page }, use) => {
    const authPage = new AuthPage(page);
    await use(authPage);
  },
});

export { expect };
