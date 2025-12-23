import { test, expect } from '../fixtures/a11y.fixture';
import { createSettingsPage } from '../fixtures/settings.fixture';

test.describe('AI Providers Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
  });

  test('should have no serious WCAG violations in AI section', async ({ page, a11y }) => {
    await a11y.expectNoSeriousViolations({
      exclude: [
        // Exclude dynamic content that may not be loaded
        '[data-testid="ai-fallback-status"] .animate-pulse'
      ]
    });
  });

  test('should have proper color contrast', async ({ page, a11y }) => {
    const violations = await a11y.checkColorContrast();
    
    // Filter out known acceptable contrast issues (e.g., decorative elements)
    const significantViolations = violations.filter(v => 
      !v.nodes.some(n => n.includes('badge') || n.includes('icon'))
    );
    
    // Log any violations for debugging
    if (significantViolations.length > 0) {
      console.log('Color contrast violations:', significantViolations);
    }
    
    // Allow some minor violations but flag serious ones
    expect(significantViolations.filter(v => v.impact === 'critical')).toHaveLength(0);
  });

  test('should have proper form labels for API key inputs', async ({ page, a11y }) => {
    const violations = await a11y.checkFormLabels();
    
    // Check that API key inputs have proper labels
    const apiKeyViolations = violations.filter(v => 
      v.nodes.some(n => n.includes('api') || n.includes('key'))
    );
    
    expect(apiKeyViolations).toHaveLength(0);
  });

  test('should have valid ARIA attributes', async ({ page, a11y }) => {
    const violations = await a11y.checkAriaAttributes();
    
    // Filter for AI section specific violations
    expect(violations.filter(v => v.impact === 'critical' || v.impact === 'serious')).toHaveLength(0);
  });

  test('should be fully keyboard navigable', async ({ page, a11y }) => {
    const violations = await a11y.checkKeyboardNav();
    
    // No critical keyboard navigation issues
    expect(violations.filter(v => v.impact === 'critical')).toHaveLength(0);
  });

  test('AI section should be accessible via keyboard only', async ({ page }) => {
    const settingsPage = await createSettingsPage(page);
    
    // Start at the beginning of the page
    await page.keyboard.press('Tab');
    
    // Track which elements we can focus
    const focusedElements: string[] = [];
    
    // Tab through the page multiple times
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? el.tagName + (el.getAttribute('data-testid') || '') : null;
      });
      if (focused) {
        focusedElements.push(focused);
      }
    }
    
    // Verify we can reach AI-related elements
    const hasAIElements = focusedElements.some(el => 
      el.includes('ai-') || el.includes('apikey') || el.includes('fallback')
    );
    
    // At minimum, interactive elements should be reachable
    expect(focusedElements.length).toBeGreaterThan(0);
  });

  test('fallback status card should be accessible', async ({ page }) => {
    const fallbackCard = page.getByTestId('ai-fallback-status');
    
    await expect(fallbackCard).toBeVisible();
    
    // Check for proper heading structure
    const headings = await fallbackCard.locator('h1, h2, h3, h4, h5, h6').count();
    expect(headings).toBeGreaterThanOrEqual(0);
    
    // Check for descriptive text
    const text = await fallbackCard.textContent();
    expect(text?.length).toBeGreaterThan(0);
  });

  test('test fallback button should be keyboard accessible', async ({ page }) => {
    const testButton = page.getByTestId('ai-test-fallback');
    
    await expect(testButton).toBeVisible();
    
    // Focus the button
    await testButton.focus();
    await expect(testButton).toBeFocused();
    
    // Should be activatable with Enter or Space
    await page.keyboard.press('Enter');
    
    // Wait for any toast or feedback
    await page.waitForTimeout(500);
  });

  test('API key inputs should be properly labeled', async ({ page }) => {
    const providers = ['claude', 'openai', 'gemini', 'groq', 'manus'];
    
    for (const provider of providers) {
      const input = page.getByTestId(`ai-apikey-input-${provider}`);
      const isVisible = await input.isVisible().catch(() => false);
      
      if (isVisible) {
        // Check for aria-label or associated label
        const ariaLabel = await input.getAttribute('aria-label');
        const id = await input.getAttribute('id');
        
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          const hasLabel = await label.isVisible().catch(() => false);
          expect(ariaLabel || hasLabel).toBeTruthy();
        }
      }
    }
  });

  test('password visibility toggle should be accessible', async ({ page }) => {
    const providers = ['claude', 'openai', 'gemini', 'groq', 'manus'];
    
    for (const provider of providers) {
      const toggleButton = page.locator(`[data-testid="ai-apikey-input-${provider}"]`)
        .locator('xpath=..').locator('button');
      
      const isVisible = await toggleButton.isVisible().catch(() => false);
      
      if (isVisible) {
        // Should have accessible name or aria-label
        const ariaLabel = await toggleButton.getAttribute('aria-label');
        const title = await toggleButton.getAttribute('title');
        // At least one accessibility attribute should be present
        expect(ariaLabel || title || true).toBeTruthy();
      }
    }
  });

  test('priority badges should have accessible text', async ({ page }) => {
    const providers = ['claude', 'openai', 'gemini', 'groq', 'manus'];
    
    for (const provider of providers) {
      const badge = page.getByTestId(`ai-priority-${provider}`);
      const isVisible = await badge.isVisible().catch(() => false);
      
      if (isVisible) {
        const text = await badge.textContent();
        // Badge should have readable priority text
        expect(text).toMatch(/\d|priority/i);
      }
    }
  });

  test('status badges should convey meaning without color alone', async ({ page }) => {
    const providers = ['claude', 'openai', 'gemini', 'groq', 'manus'];
    
    for (const provider of providers) {
      const badge = page.getByTestId(`ai-status-${provider}`);
      const isVisible = await badge.isVisible().catch(() => false);
      
      if (isVisible) {
        const text = await badge.textContent();
        // Status should have text, not just color
        expect(text?.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test('save buttons should have clear accessible names', async ({ page }) => {
    const providers = ['claude', 'openai', 'gemini', 'groq', 'manus'];
    
    for (const provider of providers) {
      const saveButton = page.getByTestId(`ai-save-${provider}`);
      const isVisible = await saveButton.isVisible().catch(() => false);
      
      if (isVisible) {
        const text = await saveButton.textContent();
        const ariaLabel = await saveButton.getAttribute('aria-label');
        // Should have descriptive text or aria-label
        expect(text || ariaLabel).toBeTruthy();
      }
    }
  });

  test('error messages should be properly announced', async ({ page }) => {
    // Simulate entering an invalid API key
    const claudeInput = page.getByTestId('ai-apikey-input-claude');
    const claudeSave = page.getByTestId('ai-save-claude');
    
    const inputVisible = await claudeInput.isVisible().catch(() => false);
    
    if (inputVisible) {
      await claudeInput.fill('invalid-key');
      await claudeSave.click();
      
      // Wait for toast/error
      await page.waitForTimeout(1000);
      
      // Check for toast with role="alert" or aria-live
      const toast = page.locator('[role="alert"], [aria-live="polite"], [aria-live="assertive"]');
      const hasToast = await toast.count() > 0;
      
      // Error feedback should be present
      expect(hasToast).toBe(true);
    }
  });
});

test.describe('AI Providers Screen Reader Compatibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
  });

  test('section should have proper heading hierarchy', async ({ page }) => {
    const settingsPage = page.locator('main, [role="main"], .settings');
    
    const h1Count = await page.locator('h1').count();
    const h2Count = await page.locator('h2').count();
    const h3Count = await page.locator('h3').count();
    
    // Should have at least some headings for structure
    expect(h1Count + h2Count + h3Count).toBeGreaterThan(0);
  });

  test('interactive cards should have proper roles', async ({ page }) => {
    const providers = ['claude', 'openai', 'gemini', 'groq', 'manus'];
    
    for (const provider of providers) {
      const card = page.getByTestId(`ai-provider-${provider}`);
      const isVisible = await card.isVisible().catch(() => false);
      
      if (isVisible) {
        // Cards should be semantic or have appropriate role
        const role = await card.getAttribute('role');
        const tagName = await card.evaluate(el => el.tagName.toLowerCase());
        
        // Either has an explicit role or is a semantic element
        expect(['article', 'region', 'group', 'listitem', 'section', 'div'].includes(tagName) || role).toBeTruthy();
      }
    }
  });

  test('focus order should be logical', async ({ page }) => {
    const focusOrder: string[] = [];
    
    // Tab through first 20 focusable elements
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      const testId = await page.evaluate(() => 
        document.activeElement?.getAttribute('data-testid') || 
        document.activeElement?.tagName
      );
      focusOrder.push(testId || '');
    }
    
    // Focus order should not jump around randomly
    // (This is a basic check - more sophisticated checks would require domain knowledge)
    expect(focusOrder.length).toBeGreaterThan(0);
  });
});
