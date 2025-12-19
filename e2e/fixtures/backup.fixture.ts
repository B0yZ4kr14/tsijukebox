import { type Page, type Locator, expect } from '@playwright/test';

export class BackupPage {
  readonly page: Page;

  // BackupManager locators
  readonly backupManager: Locator;
  readonly backupTabs: Locator;
  readonly demoWarning: Locator;

  // BackupActions locators
  readonly backupActions: Locator;
  readonly fullBackupButton: Locator;
  readonly incrementalButton: Locator;

  // BackupScheduler locators
  readonly scheduler: Locator;
  readonly scheduleToggle: Locator;
  readonly frequencySelect: Locator;
  readonly timeInput: Locator;
  readonly retentionInput: Locator;

  constructor(page: Page) {
    this.page = page;

    // BackupManager
    this.backupManager = page.getByTestId('backup-manager');
    this.backupTabs = page.getByTestId('backup-tabs');
    this.demoWarning = page.getByTestId('backup-demo-warning');

    // BackupActions
    this.backupActions = page.getByTestId('backup-actions');
    this.fullBackupButton = page.getByTestId('backup-full-button');
    this.incrementalButton = page.getByTestId('backup-incremental-button');

    // BackupScheduler
    this.scheduler = page.getByTestId('backup-scheduler');
    this.scheduleToggle = page.getByTestId('schedule-toggle');
    this.frequencySelect = page.getByTestId('schedule-frequency');
    this.timeInput = page.getByTestId('schedule-time');
    this.retentionInput = page.getByTestId('schedule-retention');
  }

  // Navigation
  async gotoSettings(): Promise<void> {
    await this.page.goto('/settings');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToBackupSection(): Promise<void> {
    // Navigate to backup section if not visible
    const backupSection = this.page.locator('text=Backup');
    if (await backupSection.isVisible()) {
      await backupSection.click();
    }
  }

  // BackupCard locators (dynamic)
  getBackupCard(id: string): Locator {
    return this.page.getByTestId(`backup-card-${id}`);
  }

  getRestoreButton(id: string): Locator {
    return this.page.getByTestId(`backup-restore-${id}`);
  }

  getDeleteButton(id: string): Locator {
    return this.page.getByTestId(`backup-delete-${id}`);
  }

  getAllBackupCards(): Locator {
    return this.page.locator('[data-testid^="backup-card-"]');
  }

  // Tab locators
  getTabTrigger(provider: 'local' | 'cloud' | 'distributed'): Locator {
    return this.page.getByTestId(`backup-tab-${provider}`);
  }

  getProviderCheckbox(provider: 'local' | 'cloud' | 'distributed'): Locator {
    return this.page.getByTestId(`schedule-provider-${provider}`);
  }

  // Actions
  async createFullBackup(): Promise<void> {
    await this.fullBackupButton.click();
  }

  async createIncrementalBackup(): Promise<void> {
    await this.incrementalButton.click();
  }

  async restoreBackup(id: string): Promise<void> {
    await this.getRestoreButton(id).click();
  }

  async deleteBackup(id: string): Promise<void> {
    await this.getDeleteButton(id).click();
  }

  async switchToProvider(provider: 'local' | 'cloud' | 'distributed'): Promise<void> {
    await this.getTabTrigger(provider).click();
  }

  async enableScheduler(): Promise<void> {
    const isChecked = await this.scheduleToggle.getAttribute('data-state');
    if (isChecked !== 'checked') {
      await this.scheduleToggle.click();
    }
  }

  async disableScheduler(): Promise<void> {
    const isChecked = await this.scheduleToggle.getAttribute('data-state');
    if (isChecked === 'checked') {
      await this.scheduleToggle.click();
    }
  }

  async setScheduleFrequency(frequency: 'hourly' | 'daily' | 'weekly'): Promise<void> {
    await this.frequencySelect.click();
    const optionLabel = frequency === 'hourly' ? 'A cada hora' : frequency === 'daily' ? 'Diário' : 'Semanal';
    await this.page.getByText(optionLabel).click();
  }

  async setScheduleTime(time: string): Promise<void> {
    await this.timeInput.fill(time);
  }

  async setRetentionDays(days: number): Promise<void> {
    await this.retentionInput.fill(String(days));
  }

  async toggleProviderInSchedule(provider: 'local' | 'cloud' | 'distributed'): Promise<void> {
    await this.getProviderCheckbox(provider).click();
  }

  // Assertions helpers
  async getBackupCount(): Promise<number> {
    return await this.getAllBackupCards().count();
  }

  async waitForToast(messagePattern: string | RegExp): Promise<void> {
    const toast = this.page.locator('.sonner-toast, [role="status"]');
    await expect(toast.filter({ hasText: messagePattern })).toBeVisible({ timeout: 5000 });
  }

  async expectBackupCardVisible(id: string): Promise<void> {
    await expect(this.getBackupCard(id)).toBeVisible();
  }

  async expectDemoWarningVisible(): Promise<void> {
    await expect(this.demoWarning).toBeVisible();
  }

  async expectButtonsDisabled(): Promise<void> {
    await expect(this.fullBackupButton).toBeDisabled();
    if (await this.incrementalButton.isVisible()) {
      await expect(this.incrementalButton).toBeDisabled();
    }
  }

  async expectSchedulerVisible(): Promise<void> {
    await expect(this.scheduler).toBeVisible();
  }

  async expectSchedulerHidden(): Promise<void> {
    await expect(this.scheduler).not.toBeVisible();
  }

  // LocalStorage helpers
  async setDemoMode(enabled: boolean): Promise<void> {
    await this.page.evaluate((val) => {
      localStorage.setItem('tsi-jukebox-demo-mode', String(val));
    }, enabled);
  }

  async clearLocalStorage(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.clear();
    });
  }

  async setLocalStorageBackups(backups: unknown[]): Promise<void> {
    await this.page.evaluate((data) => {
      localStorage.setItem('tsi-jukebox-backups', JSON.stringify(data));
    }, backups);
  }
}
