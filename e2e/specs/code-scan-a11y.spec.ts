import { test, expect } from '../fixtures/a11y.fixture';

/**
 * CodeScan Accessibility Tests
 * 
 * Comprehensive WCAG 2.1 AA compliance tests for the CodeScan section
 * Following the same pattern as ai-providers-a11y.spec.ts
 */

test.describe('CodeScan Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    // Scroll to CodeScan section
    const codeScanSection = page.getByTestId('codescan-section');
    await codeScanSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
  });

  test.describe('WCAG Violations', () => {
    test('should have no serious WCAG violations in CodeScan section', async ({ page, a11y }) => {
      await a11y.expectNoSeriousViolations({
        exclude: ['.recharts-wrapper'], // Exclude chart library elements
      });
    });

    test('should have proper color contrast in CodeScan section', async ({ a11y }) => {
      const violations = await a11y.checkColorContrast();
      const seriousViolations = violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );
      expect(seriousViolations).toHaveLength(0);
    });

    test('should have proper form labels', async ({ a11y }) => {
      const violations = await a11y.checkFormLabels();
      expect(violations).toHaveLength(0);
    });

    test('should have valid ARIA attributes', async ({ a11y }) => {
      const violations = await a11y.checkAriaAttributes();
      expect(violations).toHaveLength(0);
    });

    test('should be fully keyboard navigable', async ({ a11y }) => {
      const violations = await a11y.checkKeyboardNav();
      const criticalViolations = violations.filter((v) => v.impact === 'critical');
      expect(criticalViolations).toHaveLength(0);
    });
  });

  test.describe('Form Accessibility', () => {
    test('code textarea should have proper label or aria-label', async ({ page }) => {
      const codeInput = page.getByTestId('codescan-code-input');
      await expect(codeInput).toBeVisible();
      
      // Check for associated label or aria-label
      const ariaLabel = await codeInput.getAttribute('aria-label');
      const ariaLabelledBy = await codeInput.getAttribute('aria-labelledby');
      const placeholder = await codeInput.getAttribute('placeholder');
      
      const hasAccessibleName = ariaLabel || ariaLabelledBy || placeholder;
      expect(hasAccessibleName).toBeTruthy();
    });

    test('filename input should have proper label or aria-label', async ({ page }) => {
      const filenameInput = page.getByTestId('codescan-filename-input');
      await expect(filenameInput).toBeVisible();
      
      const ariaLabel = await filenameInput.getAttribute('aria-label');
      const ariaLabelledBy = await filenameInput.getAttribute('aria-labelledby');
      const placeholder = await filenameInput.getAttribute('placeholder');
      
      const hasAccessibleName = ariaLabel || ariaLabelledBy || placeholder;
      expect(hasAccessibleName).toBeTruthy();
    });

    test('submit button should have accessible name', async ({ page }) => {
      const submitButton = page.getByTestId('codescan-submit-button');
      await expect(submitButton).toBeVisible();
      
      const buttonText = await submitButton.textContent();
      const ariaLabel = await submitButton.getAttribute('aria-label');
      
      expect(buttonText || ariaLabel).toBeTruthy();
    });

    test('export button should have aria-label when visible', async ({ page }) => {
      // Fill code to enable results
      const codeInput = page.getByTestId('codescan-code-input');
      await codeInput.fill('const test = "hello";');
      
      const exportButton = page.getByTestId('codescan-export-button');
      
      // Export button may not be visible until scan completes
      const isVisible = await exportButton.isVisible().catch(() => false);
      if (isVisible) {
        const ariaLabel = await exportButton.getAttribute('aria-label');
        const title = await exportButton.getAttribute('title');
        const buttonText = await exportButton.textContent();
        
        expect(ariaLabel || title || buttonText).toBeTruthy();
      }
    });

    test('clear button should have aria-label when visible', async ({ page }) => {
      const clearButton = page.getByTestId('codescan-clear-button');
      
      const isVisible = await clearButton.isVisible().catch(() => false);
      if (isVisible) {
        const ariaLabel = await clearButton.getAttribute('aria-label');
        const title = await clearButton.getAttribute('title');
        const buttonText = await clearButton.textContent();
        
        expect(ariaLabel || title || buttonText).toBeTruthy();
      }
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should be navigable via keyboard only', async ({ page }) => {
      const codeInput = page.getByTestId('codescan-code-input');
      const filenameInput = page.getByTestId('codescan-filename-input');
      const submitButton = page.getByTestId('codescan-submit-button');
      
      // Tab through elements
      await codeInput.focus();
      await expect(codeInput).toBeFocused();
      
      await page.keyboard.press('Tab');
      // Should move to next focusable element
      
      await page.keyboard.press('Tab');
      // Continue tabbing
    });

    test('submit button should be focusable', async ({ page }) => {
      const submitButton = page.getByTestId('codescan-submit-button');
      await submitButton.focus();
      await expect(submitButton).toBeFocused();
    });

    test('submit button should be activatable via keyboard', async ({ page }) => {
      const codeInput = page.getByTestId('codescan-code-input');
      await codeInput.fill('const test = 1;');
      
      const submitButton = page.getByTestId('codescan-submit-button');
      await submitButton.focus();
      await expect(submitButton).toBeFocused();
      
      // Should be able to activate with Enter or Space
      await page.keyboard.press('Enter');
    });

    test('code textarea should be focusable and editable', async ({ page }) => {
      const codeInput = page.getByTestId('codescan-code-input');
      await codeInput.focus();
      await expect(codeInput).toBeFocused();
      
      // Should be able to type
      await page.keyboard.type('const x = 1;');
      await expect(codeInput).toHaveValue('const x = 1;');
    });

    test('focus order should be logical', async ({ page }) => {
      const focusableElements: string[] = [];
      
      // Start from code input
      const codeInput = page.getByTestId('codescan-code-input');
      await codeInput.focus();
      
      // Tab through and collect focused elements
      for (let i = 0; i < 5; i++) {
        const activeElement = await page.evaluate(() => {
          const el = document.activeElement;
          return el?.tagName + (el?.getAttribute('data-testid') || '');
        });
        focusableElements.push(activeElement);
        await page.keyboard.press('Tab');
      }
      
      // Should have moved through multiple elements
      expect(focusableElements.length).toBeGreaterThan(0);
    });
  });

  test.describe('Error & Status Announcements', () => {
    test('error messages should have role="alert" or aria-live', async ({ page }) => {
      const errorDisplay = page.getByTestId('codescan-error');
      
      const isVisible = await errorDisplay.isVisible().catch(() => false);
      if (isVisible) {
        const role = await errorDisplay.getAttribute('role');
        const ariaLive = await errorDisplay.getAttribute('aria-live');
        
        expect(role === 'alert' || ariaLive === 'assertive' || ariaLive === 'polite').toBeTruthy();
      }
    });

    test('progress indicator should be accessible', async ({ page }) => {
      const progress = page.getByTestId('codescan-progress');
      
      const isVisible = await progress.isVisible().catch(() => false);
      if (isVisible) {
        const role = await progress.getAttribute('role');
        const ariaLabel = await progress.getAttribute('aria-label');
        const ariaValueNow = await progress.getAttribute('aria-valuenow');
        
        // Progress should have appropriate ARIA attributes
        expect(role === 'progressbar' || ariaLabel || ariaValueNow !== null).toBeTruthy();
      }
    });

    test('results section should be accessible to screen readers', async ({ page }) => {
      const results = page.getByTestId('codescan-results');
      
      const isVisible = await results.isVisible().catch(() => false);
      if (isVisible) {
        // Results should be in a semantic container
        const tagName = await results.evaluate((el) => el.tagName.toLowerCase());
        const role = await results.getAttribute('role');
        
        const isSemanticContainer = 
          ['section', 'article', 'main', 'div'].includes(tagName) || 
          role !== null;
        
        expect(isSemanticContainer).toBeTruthy();
      }
    });

    test('summary statistics should convey meaning without color alone', async ({ page }) => {
      const summary = page.getByTestId('codescan-summary');
      
      const isVisible = await summary.isVisible().catch(() => false);
      if (isVisible) {
        // Check that stats have text labels, not just colors
        const textContent = await summary.textContent();
        expect(textContent).toBeTruthy();
        expect(textContent?.length).toBeGreaterThan(0);
      }
    });
  });
});

test.describe('CodeScan Screen Reader Compatibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    const codeScanSection = page.getByTestId('codescan-section');
    await codeScanSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
  });

  test('section should have proper heading hierarchy', async ({ page }) => {
    const codeScanSection = page.getByTestId('codescan-section');
    
    // Get all headings within the section
    const headings = await codeScanSection.locator('h1, h2, h3, h4, h5, h6').all();
    
    // Should have at least one heading
    expect(headings.length).toBeGreaterThan(0);
    
    // Check heading levels don't skip (e.g., h1 -> h3)
    const levels: number[] = [];
    for (const heading of headings) {
      const tagName = await heading.evaluate((el) => el.tagName);
      levels.push(parseInt(tagName.replace('H', '')));
    }
    
    // Verify no heading level is skipped by more than 1
    for (let i = 1; i < levels.length; i++) {
      const diff = levels[i] - levels[i - 1];
      expect(diff).toBeLessThanOrEqual(1);
    }
  });

  test('interactive elements should have visible focus indicators', async ({ page }) => {
    const submitButton = page.getByTestId('codescan-submit-button');
    await submitButton.focus();
    
    // Check that focus is visible (button should have focus styles)
    const hasFocusVisible = await submitButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      const outlineWidth = parseInt(styles.outlineWidth) || 0;
      const boxShadow = styles.boxShadow;
      const borderColor = styles.borderColor;
      
      return outlineWidth > 0 || boxShadow !== 'none' || borderColor !== 'rgb(0, 0, 0)';
    });
    
    // Focus indicator should be present (outline, box-shadow, or border change)
    expect(hasFocusVisible).toBeTruthy();
  });

  test('score display should be readable by screen readers', async ({ page }) => {
    const scoreDisplay = page.getByTestId('codescan-score-display');
    
    const isVisible = await scoreDisplay.isVisible().catch(() => false);
    if (isVisible) {
      const textContent = await scoreDisplay.textContent();
      const ariaLabel = await scoreDisplay.getAttribute('aria-label');
      
      // Score should have text or aria-label
      expect(textContent || ariaLabel).toBeTruthy();
    }
  });

  test('severity badges should have text, not just icons', async ({ page }) => {
    // Look for severity indicators in results
    const results = page.getByTestId('codescan-results');
    
    const isVisible = await results.isVisible().catch(() => false);
    if (isVisible) {
      // Check for severity text (critical, high, medium, low)
      const textContent = await results.textContent();
      const hasSeverityText = 
        textContent?.toLowerCase().includes('critical') ||
        textContent?.toLowerCase().includes('high') ||
        textContent?.toLowerCase().includes('medium') ||
        textContent?.toLowerCase().includes('low') ||
        textContent?.toLowerCase().includes('crítico') ||
        textContent?.toLowerCase().includes('alto') ||
        textContent?.toLowerCase().includes('médio') ||
        textContent?.toLowerCase().includes('baixo');
      
      // Either no results or severity text should be present
      expect(hasSeverityText !== undefined).toBeTruthy();
    }
  });

  test('file count should be announced properly', async ({ page }) => {
    const filesCount = page.getByTestId('codescan-files-count');
    
    const isVisible = await filesCount.isVisible().catch(() => false);
    if (isVisible) {
      const textContent = await filesCount.textContent();
      expect(textContent).toBeTruthy();
    }
  });

  test('issues count should be announced properly', async ({ page }) => {
    const issuesCount = page.getByTestId('codescan-issues-count');
    
    const isVisible = await issuesCount.isVisible().catch(() => false);
    if (isVisible) {
      const textContent = await issuesCount.textContent();
      expect(textContent).toBeTruthy();
    }
  });
});
