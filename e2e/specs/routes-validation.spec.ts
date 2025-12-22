/**
 * ============================================================================
 * E2E Tests: Route Validation
 * ============================================================================
 * 
 * Validates that all application routes load correctly after refactoring.
 * Tests cover public, protected, and integration-specific routes.
 * 
 * Synced with: src/routes/index.tsx v4.2.0
 * 
 * @see docs/ROUTES.md for complete route documentation
 * ============================================================================
 */

import { test, expect } from '@playwright/test';

// ============================================================================
// Route Definitions - Synced with src/routes/index.tsx
// ============================================================================

/**
 * Public Routes - Accessible without authentication
 * From: publicRoutes in src/routes/index.tsx
 */
const publicRoutes = [
  { path: '/', name: 'Index', expectedContent: /jukebox|music|player/i },
  { path: '/auth', name: 'Auth', expectedContent: /login|sign in|entrar|email/i },
  { path: '/setup', name: 'Setup Wizard', expectedContent: /setup|wizard|configurar/i },
  { path: '/install', name: 'Install', expectedContent: /install|instalar|download/i },
  { path: '/help', name: 'Help', expectedContent: /help|ajuda|support/i },
  { path: '/wiki', name: 'Wiki', expectedContent: /wiki|documentation|docs/i },
  { path: '/landing', name: 'Landing', expectedContent: /welcome|bem-vindo|jukebox/i },
  { path: '/wcag-exceptions', name: 'WCAG Exceptions', expectedContent: /wcag|accessibility|acessibilidade/i },
  { path: '/a11y-dashboard', name: 'A11y Dashboard', expectedContent: /accessibility|a11y|acessibilidade/i },
  { path: '/lyrics-test', name: 'Lyrics Test', expectedContent: /lyrics|letras|karaoke/i },
  { path: '/brand', name: 'Brand Guidelines', expectedContent: /brand|marca|logo|design/i },
  { path: '/changelog', name: 'Changelog', expectedContent: /changelog|version|versão/i },
  { path: '/showcase', name: 'Components Showcase', expectedContent: /components|showcase|componentes/i },
  { path: '/installer-metrics', name: 'Installer Metrics', expectedContent: /installer|metrics|métricas/i },
  { path: '/version-comparison', name: 'Version Comparison', expectedContent: /version|comparison|versão/i },
  { path: '/logo-github', name: 'Logo GitHub Preview', expectedContent: /logo|github|preview/i },
];

/**
 * Spotify Routes - Spotify integration
 * From: spotifyRoutes in src/routes/index.tsx
 */
const spotifyRoutes = [
  { path: '/spotify', name: 'Spotify Browser', expectedContent: /spotify|browse|navegar/i },
  { path: '/spotify/search', name: 'Spotify Search', expectedContent: /search|buscar|pesquisar|spotify/i },
  { path: '/spotify/library', name: 'Spotify Library', expectedContent: /library|biblioteca|spotify/i },
];

/**
 * YouTube Music Routes - YouTube Music integration
 * From: youtubeRoutes in src/routes/index.tsx
 */
const youtubeRoutes = [
  { path: '/youtube-music', name: 'YouTube Music Browser', expectedContent: /youtube|music|browse/i },
  { path: '/youtube-music/search', name: 'YouTube Music Search', expectedContent: /search|buscar|youtube/i },
  { path: '/youtube-music/library', name: 'YouTube Music Library', expectedContent: /library|biblioteca|youtube/i },
];

/**
 * Dashboard Routes - Require authentication
 * From: dashboardRoutes in src/routes/index.tsx
 */
const dashboardRoutes = [
  { path: '/dashboard', name: 'Dashboard', requiresAuth: true },
  { path: '/github-dashboard', name: 'GitHub Dashboard', requiresAuth: true },
  { path: '/clients-monitor', name: 'Clients Monitor', requiresAuth: true },
  { path: '/stats', name: 'Jukebox Stats', requiresAuth: true },
  { path: '/health', name: 'Health Dashboard', requiresAuth: true },
  { path: '/spicetify-themes', name: 'Spicetify Themes', requiresAuth: true },
  { path: '/kiosk-monitor', name: 'Kiosk Monitor', requiresAuth: true },
];

/**
 * Protected Routes - Require authentication
 * From: protectedRoutes in src/routes/index.tsx
 */
const protectedRoutes = [
  { path: '/settings', name: 'Settings', requiresAuth: true },
  { path: '/settings/diagnostics', name: 'System Diagnostics', requiresAuth: true },
  { path: '/theme-preview', name: 'Theme Preview', requiresAuth: true },
];

/**
 * Admin Routes - Require authentication
 * From: adminRoutes in src/routes/index.tsx
 */
const adminRoutes = [
  { path: '/admin', name: 'Admin', requiresAuth: true },
  { path: '/admin/library', name: 'Admin Library', requiresAuth: true },
  { path: '/admin/logs', name: 'Admin Logs', requiresAuth: true },
  { path: '/admin/feedback', name: 'Admin Feedback', requiresAuth: true },
];

// ============================================================================
// Test Suites
// ============================================================================

test.describe('Route Validation - Public Routes', () => {
  for (const route of publicRoutes) {
    test(`${route.name} (${route.path}) should load successfully`, async ({ page }) => {
      const response = await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      
      // Should return successful HTTP status
      expect(response?.status()).toBeLessThan(400);
      
      // Should not redirect to 404
      await expect(page).not.toHaveURL(/not-found|404/i);
      
      // Should have expected content
      if (route.expectedContent) {
        await expect(page.locator('body')).toContainText(route.expectedContent, { timeout: 10000 });
      }
    });
  }
});

test.describe('Route Validation - Spotify Integration', () => {
  for (const route of spotifyRoutes) {
    test(`${route.name} (${route.path}) should load`, async ({ page }) => {
      const response = await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      
      expect(response?.status()).toBeLessThan(400);
      await expect(page).not.toHaveURL(/not-found|404/i);
    });
  }
});

test.describe('Route Validation - YouTube Music Integration', () => {
  for (const route of youtubeRoutes) {
    test(`${route.name} (${route.path}) should load`, async ({ page }) => {
      const response = await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      
      expect(response?.status()).toBeLessThan(400);
      await expect(page).not.toHaveURL(/not-found|404/i);
    });
  }
});

test.describe('Route Validation - Dashboard Routes', () => {
  for (const route of dashboardRoutes) {
    test(`${route.name} (${route.path}) should redirect unauthenticated users`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      
      // Should redirect to auth or show access denied for protected routes
      const currentUrl = page.url();
      const isAuthRedirect = /auth|login|sign-in|access-denied/i.test(currentUrl);
      const hasAuthContent = await page.locator('text=/login|sign in|access denied|entrar/i').count() > 0;
      
      expect(isAuthRedirect || hasAuthContent).toBeTruthy();
    });
  }
});

test.describe('Route Validation - Protected Routes', () => {
  for (const route of protectedRoutes) {
    test(`${route.name} (${route.path}) should require authentication`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      
      const currentUrl = page.url();
      const isAuthRedirect = /auth|login|sign-in|access-denied/i.test(currentUrl);
      const hasAuthContent = await page.locator('text=/login|sign in|access denied|entrar/i').count() > 0;
      
      expect(isAuthRedirect || hasAuthContent).toBeTruthy();
    });
  }
});

test.describe('Route Validation - Admin Routes', () => {
  for (const route of adminRoutes) {
    test(`${route.name} (${route.path}) should require authentication`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      
      const currentUrl = page.url();
      const isAuthRedirect = /auth|login|sign-in|access-denied/i.test(currentUrl);
      const hasAuthContent = await page.locator('text=/login|sign in|access denied|entrar/i').count() > 0;
      
      expect(isAuthRedirect || hasAuthContent).toBeTruthy();
    });
  }
});

test.describe('Route Validation - 404 Handling', () => {
  test('should display 404 page for invalid routes', async ({ page }) => {
    await page.goto('/this-route-definitely-does-not-exist-xyz-123', { waitUntil: 'domcontentloaded' });
    
    // Should show 404 content
    const has404Content = await page.locator('text=/404|not found|página não encontrada|voltar/i').count() > 0;
    expect(has404Content).toBeTruthy();
  });

  test('should display 404 for nested invalid routes', async ({ page }) => {
    await page.goto('/admin/invalid-nested-route-abc', { waitUntil: 'domcontentloaded' });
    
    const has404OrAuth = await page.locator('text=/404|not found|login|sign in|access denied/i').count() > 0;
    expect(has404OrAuth).toBeTruthy();
  });

  test('should display 404 for spotify nested invalid routes', async ({ page }) => {
    await page.goto('/spotify/invalid-page-xyz', { waitUntil: 'domcontentloaded' });
    
    const has404Content = await page.locator('text=/404|not found|página não encontrada/i').count() > 0;
    expect(has404Content).toBeTruthy();
  });
});

test.describe('Route Validation - Redirects', () => {
  test('/login should redirect to /auth', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/auth/);
  });

  test('/brand-guidelines should load brand page', async ({ page }) => {
    const response = await page.goto('/brand-guidelines', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);
  });
});

test.describe('Route Validation - Navigation', () => {
  test('should navigate between public routes without errors', async ({ page }) => {
    // Start at home
    await page.goto('/');
    await expect(page).toHaveURL('/');
    
    // Navigate to help
    await page.goto('/help');
    await expect(page).toHaveURL('/help');
    
    // Navigate to wiki
    await page.goto('/wiki');
    await expect(page).toHaveURL('/wiki');
    
    // No console errors should occur
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Give time for any async errors
    await page.waitForTimeout(1000);
    
    // Filter out known non-critical errors
    const criticalErrors = consoleErrors.filter(
      err => !err.includes('favicon') && !err.includes('manifest') && !err.includes('ResizeObserver')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    await page.goto('/');
    await page.goto('/help');
    await page.goto('/wiki');
    
    // Go back
    await page.goBack();
    await expect(page).toHaveURL('/help');
    
    // Go back again
    await page.goBack();
    await expect(page).toHaveURL('/');
    
    // Go forward
    await page.goForward();
    await expect(page).toHaveURL('/help');
  });
});

test.describe('Route Validation - Performance', () => {
  test('index page should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('help page should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/help', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(5000);
  });

  test('spotify browser should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/spotify', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(5000);
  });
});

// ============================================================================
// Route Statistics Test
// ============================================================================

test.describe('Route Statistics', () => {
  test('should have expected number of routes defined', () => {
    const totalRoutes = 
      publicRoutes.length + 
      spotifyRoutes.length + 
      youtubeRoutes.length + 
      dashboardRoutes.length + 
      protectedRoutes.length + 
      adminRoutes.length;
    
    // Expected: 16 public + 3 spotify + 3 youtube + 7 dashboard + 3 protected + 4 admin = 36
    expect(totalRoutes).toBeGreaterThanOrEqual(36);
    
    console.log(`Total routes tested: ${totalRoutes}`);
    console.log(`  - Public: ${publicRoutes.length}`);
    console.log(`  - Spotify: ${spotifyRoutes.length}`);
    console.log(`  - YouTube: ${youtubeRoutes.length}`);
    console.log(`  - Dashboard: ${dashboardRoutes.length}`);
    console.log(`  - Protected: ${protectedRoutes.length}`);
    console.log(`  - Admin: ${adminRoutes.length}`);
  });
});
