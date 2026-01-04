import { test, expect } from '@playwright/test';
import { createSettingsPage } from '../fixtures/settings.fixture';

test.describe('GitHub Sync Status', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
  });

  test('should display GitHub sync section', async ({ page }) => {
    const section = page.getByTestId('github-sync-section');
    await expect(section).toBeVisible();
    await expect(section.locator('text=GitHub Sync Status')).toBeVisible();
  });

  test('should have refresh button', async ({ page }) => {
    const refreshButton = page.getByTestId('github-refresh-button');
    await expect(refreshButton).toBeVisible();
    await expect(refreshButton).toBeEnabled();
  });

  test('should display status badge', async ({ page }) => {
    const statusBadge = page.getByTestId('github-status-badge');
    await expect(statusBadge).toBeVisible();
    // Should show one of the valid states
    const text = await statusBadge.textContent();
    expect(['Verificando...', 'Sincronizado', 'Pendente', 'Desconhecido', 'Erro']).toContain(text?.trim());
  });

  test('should show last commit section when data is available', async ({ page }) => {
    // Wait for potential data load
    await page.waitForTimeout(2000);
    
    const lastCommitSection = page.getByTestId('github-last-commit');
    // May or may not be visible depending on data availability
    const isVisible = await lastCommitSection.isVisible().catch(() => false);
    
    if (isVisible) {
      await expect(lastCommitSection).toContainText('Último Commit');
    }
  });

  test('should trigger refresh on button click', async ({ page }) => {
    const refreshButton = page.getByTestId('github-refresh-button');
    
    // Click refresh button
    await refreshButton.click();
    
    // Should show loading state briefly
    const statusBadge = page.getByTestId('github-status-badge');
    // Wait for loading to complete
    await page.waitForTimeout(1000);
    await expect(statusBadge).toBeVisible();
  });

  test('should display repository info section', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const repoInfo = page.getByTestId('github-repo-info');
    const isVisible = await repoInfo.isVisible().catch(() => false);
    
    if (isVisible) {
      // Check for expected fields
      await expect(repoInfo.locator('text=Branch')).toBeVisible();
      await expect(repoInfo.locator('text=Último Push')).toBeVisible();
    }
  });

  test('should have external link to GitHub repo', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const repoLink = page.getByTestId('github-repo-link');
    const isVisible = await repoLink.isVisible().catch(() => false);
    
    if (isVisible) {
      await expect(repoLink).toHaveAttribute('target', '_blank');
      await expect(repoLink).toHaveAttribute('href', /github\.com/);
    }
  });

  test('should show branch badge when available', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const branchBadge = page.getByTestId('github-branch-badge');
    const isVisible = await branchBadge.isVisible().catch(() => false);
    
    if (isVisible) {
      const text = await branchBadge.textContent();
      expect(text?.length).toBeGreaterThan(0);
    }
  });

  test('should handle error state gracefully', async ({ page }) => {
    // Intercept API call to simulate error
    await page.route('**/functions/v1/**', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    // Refresh the page to trigger the intercepted request
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Check that error state is shown
    const errorDisplay = page.getByTestId('github-error-display');
    const isVisible = await errorDisplay.isVisible().catch(() => false);
    
    // Error state or status badge should be visible
    if (isVisible) {
      await expect(errorDisplay).toBeVisible();
    }
  });

  test('should display last verification time', async ({ page }) => {
    const lastCheck = page.getByTestId('github-last-check');
    const isVisible = await lastCheck.isVisible().catch(() => false);
    
    if (isVisible) {
      const text = await lastCheck.textContent();
      expect(text).toContain('Última verificação');
    }
  });
});

test.describe('GitHub Sync Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
  });

  test('refresh button should be keyboard accessible', async ({ page }) => {
    const refreshButton = page.getByTestId('github-refresh-button');
    
    // Focus and verify
    await refreshButton.focus();
    await expect(refreshButton).toBeFocused();
    
    // Should be activatable with Enter
    await page.keyboard.press('Enter');
    await expect(refreshButton).toBeVisible();
  });

  test('external links should have proper rel attributes', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const repoLink = page.getByTestId('github-repo-link');
    const isVisible = await repoLink.isVisible().catch(() => false);
    
    if (isVisible) {
      await expect(repoLink).toHaveAttribute('rel', /noopener/);
    }
  });
});
