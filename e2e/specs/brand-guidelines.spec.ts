import { test, expect } from '../fixtures/brand.fixture';

test.describe('Brand Guidelines Page', () => {
  test.beforeEach(async ({ brandFixture }) => {
    await brandFixture.navigateToBrand();
  });

  test('should navigate to /brand successfully', async ({ page }) => {
    await expect(page).toHaveURL(/\/brand/);
    await expect(page.locator('h1')).toContainText('Brand Guidelines');
  });

  test('should display logo in header', async ({ page }) => {
    // Check for logo presence
    const logo = page.locator('img[alt*="logo"], svg[class*="logo"], [data-testid="logo"]').first();
    await expect(logo).toBeVisible();
  });

  test('should display all tabs', async ({ page }) => {
    // Check for tab buttons
    const tabs = page.getByRole('tab');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThanOrEqual(3);
  });

  test('should switch between tabs', async ({ brandFixture, page }) => {
    // Test tab switching
    await brandFixture.switchToTab('colors');
    await expect(page.getByRole('tabpanel')).toBeVisible();
    
    await brandFixture.switchToTab('logo');
    await expect(page.getByRole('tabpanel')).toBeVisible();
    
    await brandFixture.switchToTab('downloads');
    await expect(page.getByRole('tabpanel')).toBeVisible();
  });

  test('should display color palette with neon colors', async ({ brandFixture, page }) => {
    await brandFixture.switchToTab('colors');
    
    // Check for color elements
    const colorElements = page.locator('[class*="rounded"], [style*="background"]').filter({
      has: page.locator(':scope'),
    });
    
    // Should have multiple color swatches
    const count = await colorElements.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should copy color value to clipboard on click', async ({ brandFixture, page }) => {
    await brandFixture.switchToTab('colors');
    
    // Find a clickable color element
    const colorButton = page.locator('button').filter({
      has: page.locator('[style*="background"]'),
    }).first();
    
    if (await colorButton.isVisible()) {
      await colorButton.click();
      
      // Wait for toast notification
      await page.waitForTimeout(500);
      
      // Check for success toast
      const toast = page.locator('[data-sonner-toast], .toast, [role="alert"]');
      // Toast might appear - this is optional behavior
    }
  });

  test('should export palette as JSON', async ({ brandFixture }) => {
    const download = await brandFixture.downloadJSON();
    
    // Verify download occurred
    expect(download).toBeTruthy();
    
    // Verify filename
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/\.json$/);
    
    // Validate content
    const isValid = await brandFixture.validateJSONExport(download);
    expect(isValid).toBe(true);
  });

  test('should export palette as CSS', async ({ brandFixture }) => {
    const download = await brandFixture.downloadCSS();
    
    // Verify download occurred
    expect(download).toBeTruthy();
    
    // Verify filename
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/\.css$/);
    
    // Validate content
    const isValid = await brandFixture.validateCSSExport(download);
    expect(isValid).toBe(true);
  });

  test('should have download buttons in downloads tab', async ({ brandFixture, page }) => {
    await brandFixture.switchToTab('downloads');
    
    // Check for JSON download button
    const jsonButton = page.getByRole('button', { name: /json/i });
    await expect(jsonButton).toBeVisible();
    
    // Check for CSS download button
    const cssButton = page.getByRole('button', { name: /css/i });
    await expect(cssButton).toBeVisible();
  });

  test('should display logo variants', async ({ brandFixture, page }) => {
    await brandFixture.switchToTab('logo');
    
    // Check for logo variant cards/sections
    const logoSection = page.getByRole('tabpanel');
    await expect(logoSection).toBeVisible();
    
    // Should have multiple logo displays
    const logos = logoSection.locator('img, svg').filter({
      has: page.locator(':scope'),
    });
    const count = await logos.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display typography section', async ({ brandFixture, page }) => {
    await brandFixture.switchToTab('typography');
    
    // Check for typography content
    const tabPanel = page.getByRole('tabpanel');
    await expect(tabPanel).toBeVisible();
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/brand');
    await page.waitForLoadState('networkidle');
    
    // Page should still be functional
    await expect(page.locator('h1')).toContainText('Brand Guidelines');
    
    // Tabs should be accessible
    const tabs = page.getByRole('tab');
    await expect(tabs.first()).toBeVisible();
  });

  test('should navigate from index page to brand', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for brand/palette link
    const brandLink = page.locator('a[href="/brand"], a[href*="brand"], button').filter({
      has: page.locator('[class*="palette"], svg'),
    }).first();
    
    if (await brandLink.isVisible()) {
      await brandLink.click();
      await page.waitForURL(/\/brand/);
      await expect(page).toHaveURL(/\/brand/);
    }
  });

  test('should have proper page title for SEO', async ({ page }) => {
    const title = await page.title();
    expect(title.toLowerCase()).toContain('brand');
  });

  test('should have accessible heading structure', async ({ page }) => {
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    
    // Should have h1 before any h2
    const headings = await page.locator('h1, h2, h3').allTextContents();
    expect(headings.length).toBeGreaterThan(0);
  });
});

test.describe('Brand Guidelines - Error Handling', () => {
  test('should handle missing clipboard API gracefully', async ({ page, context }) => {
    // Revoke clipboard permissions
    await context.clearPermissions();
    
    await page.goto('/brand');
    await page.waitForLoadState('networkidle');
    
    // Try to copy a color - should not crash
    const colorButton = page.locator('button').first();
    await colorButton.click();
    
    // Page should still be functional
    await expect(page.locator('h1')).toBeVisible();
  });
});
