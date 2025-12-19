import { test as base, expect, Page, Download } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Brand Guidelines Page Fixture
 * Provides utilities for testing brand assets and exports
 */

export interface BrandFixture {
  page: Page;
  
  // Navigation
  navigateToBrand: () => Promise<void>;
  
  // Tab navigation
  switchToTab: (tabName: 'colors' | 'logo' | 'typography' | 'downloads') => Promise<void>;
  
  // Color palette
  getColorCount: () => Promise<number>;
  copyColorToClipboard: (colorIndex: number) => Promise<void>;
  
  // Exports
  downloadJSON: () => Promise<Download>;
  downloadCSS: () => Promise<Download>;
  downloadLogo: (format: 'svg' | 'png') => Promise<Download>;
  
  // Validation
  validateJSONExport: (download: Download) => Promise<boolean>;
  validateCSSExport: (download: Download) => Promise<boolean>;
}

export const test = base.extend<{ brandFixture: BrandFixture }>({
  brandFixture: async ({ page }, use) => {
    const fixture: BrandFixture = {
      page,
      
      async navigateToBrand() {
        await page.goto('/brand');
        await page.waitForLoadState('networkidle');
        // Wait for page to be fully loaded
        await expect(page.locator('h1')).toContainText('Brand Guidelines');
      },
      
      async switchToTab(tabName) {
        const tabLabels: Record<string, string> = {
          colors: 'Cores',
          logo: 'Logo',
          typography: 'Tipografia',
          downloads: 'Downloads',
        };
        
        const label = tabLabels[tabName] || tabName;
        await page.getByRole('tab', { name: new RegExp(label, 'i') }).click();
        await page.waitForTimeout(300); // Wait for tab transition
      },
      
      async getColorCount() {
        // Count color swatches in the palette
        const colorSwatches = page.locator('[data-testid="color-swatch"], .color-swatch, button[aria-label*="color"]');
        return await colorSwatches.count();
      },
      
      async copyColorToClipboard(colorIndex) {
        const colorButtons = page.locator('[data-testid="color-swatch"], .color-swatch, button[aria-label*="color"]');
        const button = colorButtons.nth(colorIndex);
        await button.click();
        
        // Wait for toast or feedback
        await page.waitForTimeout(500);
      },
      
      async downloadJSON() {
        // Navigate to downloads tab if not there
        await this.switchToTab('downloads');
        
        const downloadPromise = page.waitForEvent('download');
        
        // Click JSON download button
        await page.getByRole('button', { name: /download.*json/i }).click();
        
        return downloadPromise;
      },
      
      async downloadCSS() {
        // Navigate to downloads tab if not there
        await this.switchToTab('downloads');
        
        const downloadPromise = page.waitForEvent('download');
        
        // Click CSS download button
        await page.getByRole('button', { name: /download.*css/i }).click();
        
        return downloadPromise;
      },
      
      async downloadLogo(format) {
        // Navigate to downloads tab if not there
        await this.switchToTab('downloads');
        
        const downloadPromise = page.waitForEvent('download');
        
        // Click appropriate logo download button
        if (format === 'svg') {
          await page.getByRole('link', { name: /svg/i }).first().click();
        } else {
          await page.getByRole('link', { name: /png/i }).first().click();
        }
        
        return downloadPromise;
      },
      
      async validateJSONExport(download) {
        const filePath = await download.path();
        if (!filePath) return false;
        
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const json = JSON.parse(content);
          
          // Validate structure
          return (
            json.version !== undefined &&
            (json.neon !== undefined || json.base !== undefined || json.colors !== undefined)
          );
        } catch {
          return false;
        }
      },
      
      async validateCSSExport(download) {
        const filePath = await download.path();
        if (!filePath) return false;
        
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          
          // Validate CSS structure
          return (
            content.includes(':root') &&
            content.includes('--') &&
            content.includes('hsl')
          );
        } catch {
          return false;
        }
      },
    };
    
    await use(fixture);
  },
});

export { expect };
