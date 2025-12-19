import { test, expect } from '@playwright/test';
import { BackupPage } from '../fixtures/backup.fixture';
import { BackupMockServer, createMockBackup, createMockBackups } from '../mocks/backup-api.mock';

test.describe('Backup Management E2E', () => {
  let backupPage: BackupPage;
  let mockServer: BackupMockServer;

  test.beforeEach(async ({ page }) => {
    backupPage = new BackupPage(page);
    mockServer = new BackupMockServer();
    await mockServer.setupRoutes(page);
    await backupPage.clearLocalStorage();
    await backupPage.gotoSettings();
  });

  test.afterEach(async () => {
    mockServer.reset();
  });

  test.describe('Backup Creation', () => {
    test('should display backup manager section', async () => {
      await expect(backupPage.backupManager).toBeVisible();
    });

    test('should have full backup button visible', async () => {
      await expect(backupPage.fullBackupButton).toBeVisible();
      await expect(backupPage.fullBackupButton).toBeEnabled();
    });

    test('should have incremental backup button visible', async () => {
      await expect(backupPage.incrementalButton).toBeVisible();
      await expect(backupPage.incrementalButton).toBeEnabled();
    });

    test('should create full backup when button is clicked', async () => {
      await backupPage.createFullBackup();
      
      // Should show success feedback (toast or updated list)
      const backupCards = backupPage.getAllBackupCards();
      await expect(backupCards).toHaveCount(1, { timeout: 5000 });
    });

    test('should create incremental backup when button is clicked', async () => {
      await backupPage.createIncrementalBackup();
      
      const backupCards = backupPage.getAllBackupCards();
      await expect(backupCards).toHaveCount(1, { timeout: 5000 });
    });

    test('should disable buttons during backup creation', async ({ page }) => {
      mockServer.setResponseDelay(1000);

      await backupPage.fullBackupButton.click();
      
      // Buttons should be disabled during loading
      await expect(backupPage.fullBackupButton).toBeDisabled();
    });
  });

  test.describe('Backup Restore', () => {
    test('should restore backup when clicking restore button', async ({ page }) => {
      // Create a backup first
      await backupPage.createFullBackup();
      await page.waitForTimeout(500);

      // Get the backup card and click restore
      const backupCards = backupPage.getAllBackupCards();
      await expect(backupCards).toHaveCount(1);

      const firstCard = backupCards.first();
      const restoreButton = firstCard.locator('[data-testid^="backup-restore-"]');
      await restoreButton.click();

      // Should show success feedback
      await backupPage.waitForToast(/restaurado|sucesso/i);
    });
  });

  test.describe('Backup Deletion', () => {
    test('should remove backup from list after deletion', async ({ page }) => {
      // Create a backup first
      await backupPage.createFullBackup();
      await page.waitForTimeout(500);

      const backupCards = backupPage.getAllBackupCards();
      await expect(backupCards).toHaveCount(1);

      // Delete the backup
      const firstCard = backupCards.first();
      const deleteButton = firstCard.locator('[data-testid^="backup-delete-"]');
      await deleteButton.click();

      // Should be removed from list
      await expect(backupCards).toHaveCount(0, { timeout: 5000 });
    });
  });

  test.describe('Multi-Provider Tabs', () => {
    test('should display tabs when multiple providers are available', async ({ page }) => {
      // This test assumes the backup manager is configured with multiple providers
      // Check if tabs are visible when they should be
      const tabs = backupPage.backupTabs;
      
      if (await tabs.isVisible()) {
        await expect(tabs).toBeVisible();
        
        const localTab = backupPage.getTabTrigger('local');
        await expect(localTab).toBeVisible();
      }
    });

    test('should switch between provider tabs', async ({ page }) => {
      const tabs = backupPage.backupTabs;
      
      if (await tabs.isVisible()) {
        const cloudTab = backupPage.getTabTrigger('cloud');
        
        if (await cloudTab.isVisible()) {
          await cloudTab.click();
          await expect(cloudTab).toHaveAttribute('data-state', 'active');
        }
      }
    });
  });

  test.describe('Scheduler', () => {
    test('should display scheduler section', async () => {
      await expect(backupPage.scheduler).toBeVisible();
    });

    test('should toggle scheduler on/off', async () => {
      // Enable scheduler
      await backupPage.enableScheduler();
      
      // Frequency select should be visible when enabled
      await expect(backupPage.frequencySelect).toBeVisible();
      
      // Disable scheduler
      await backupPage.disableScheduler();
      
      // Frequency select should be hidden when disabled
      await expect(backupPage.frequencySelect).not.toBeVisible();
    });

    test('should change schedule frequency', async () => {
      await backupPage.enableScheduler();
      
      await backupPage.setScheduleFrequency('weekly');
      
      await expect(backupPage.frequencySelect).toContainText('Semanal');
    });

    test('should update schedule time', async () => {
      await backupPage.enableScheduler();
      
      await backupPage.setScheduleTime('14:30');
      
      await expect(backupPage.timeInput).toHaveValue('14:30');
    });

    test('should update retention days', async () => {
      await backupPage.enableScheduler();
      
      await backupPage.setRetentionDays(30);
      
      await expect(backupPage.retentionInput).toHaveValue('30');
    });
  });

  test.describe('Demo Mode', () => {
    test('should show warning in demo mode', async ({ page }) => {
      await backupPage.setDemoMode(true);
      await page.reload();
      await page.waitForLoadState('networkidle');

      await backupPage.expectDemoWarningVisible();
    });

    test('should disable all buttons in demo mode', async ({ page }) => {
      await backupPage.setDemoMode(true);
      await page.reload();
      await page.waitForLoadState('networkidle');

      await backupPage.expectButtonsDisabled();
    });
  });

  test.describe('Error Handling', () => {
    test('should show error toast on API failure', async ({ page }) => {
      mockServer.setShouldFail(true);

      await backupPage.createFullBackup();

      // Should show error feedback
      await backupPage.waitForToast(/erro|falha|failed/i);
    });

    test('should handle restore failure gracefully', async ({ page }) => {
      // Create a backup first (with success)
      await backupPage.createFullBackup();
      await page.waitForTimeout(500);

      // Now set failure mode
      mockServer.setShouldFail(true);

      // Try to restore
      const backupCards = backupPage.getAllBackupCards();
      const firstCard = backupCards.first();
      const restoreButton = firstCard.locator('[data-testid^="backup-restore-"]');
      await restoreButton.click();

      // Should show error feedback
      await backupPage.waitForToast(/erro|falha|failed/i);
    });
  });

  test.describe('LocalStorage Persistence', () => {
    test('should load backups from localStorage on page load', async ({ page }) => {
      const mockBackups = createMockBackups(3);

      await backupPage.setLocalStorageBackups(mockBackups);
      await page.reload();
      await page.waitForLoadState('networkidle');

      const backupCards = backupPage.getAllBackupCards();
      await expect(backupCards).toHaveCount(3);
    });
  });
});
