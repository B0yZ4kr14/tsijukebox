import { type Page, type Route } from '@playwright/test';

export interface MockBackup {
  id: string;
  name: string;
  type: 'full' | 'incremental';
  size: string;
  date: string;
  provider: 'local' | 'cloud' | 'distributed';
  status: 'completed' | 'pending' | 'failed' | 'syncing';
}

export interface MockBackupResponse {
  success: boolean;
  id?: string;
  name?: string;
  size?: string;
  message?: string;
}

export class BackupMockServer {
  private backups: MockBackup[] = [];
  private shouldFail = false;
  private responseDelay = 0;

  async setupRoutes(page: Page): Promise<void> {
    // Mock POST /api/backup/*/full
    await page.route('**/api/backup/*/full', async (route) => {
      await this.handleBackupCreate(route, 'full');
    });

    // Mock POST /api/backup/*/incremental
    await page.route('**/api/backup/*/incremental', async (route) => {
      await this.handleBackupCreate(route, 'incremental');
    });

    // Mock POST /api/backup/restore/*
    await page.route('**/api/backup/restore/*', async (route) => {
      await this.handleRestore(route);
    });

    // Mock DELETE /api/backup/*
    await page.route('**/api/backup/*', async (route) => {
      const method = route.request().method();
      if (method === 'DELETE') {
        await this.handleDelete(route);
      } else {
        await route.continue();
      }
    });

    // Mock GET /api/backup/list
    await page.route('**/api/backup/list', async (route) => {
      await this.handleList(route);
    });
  }

  private async handleBackupCreate(route: Route, type: 'full' | 'incremental'): Promise<void> {
    if (this.responseDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.responseDelay));
    }

    if (this.shouldFail) {
      await route.fulfill({
        status: 500,
        json: { success: false, message: 'Storage quota exceeded' },
      });
      return;
    }

    const urlParts = route.request().url().split('/');
    const providerIndex = urlParts.findIndex((part) => part === 'backup') + 1;
    const provider = urlParts[providerIndex] as MockBackup['provider'];

    const newBackup = this.createMockBackup(type, provider);
    this.backups.push(newBackup);

    await route.fulfill({
      status: 200,
      json: { success: true, ...newBackup },
    });
  }

  private async handleRestore(route: Route): Promise<void> {
    if (this.responseDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.responseDelay));
    }

    if (this.shouldFail) {
      await route.fulfill({
        status: 500,
        json: { success: false, message: 'Restore failed' },
      });
      return;
    }

    await route.fulfill({
      status: 200,
      json: { success: true, message: 'Backup restaurado com sucesso' },
    });
  }

  private async handleDelete(route: Route): Promise<void> {
    if (this.responseDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.responseDelay));
    }

    if (this.shouldFail) {
      await route.fulfill({
        status: 500,
        json: { success: false, message: 'Delete failed' },
      });
      return;
    }

    const urlParts = route.request().url().split('/');
    const id = urlParts[urlParts.length - 1];
    this.backups = this.backups.filter((b) => b.id !== id);

    await route.fulfill({
      status: 200,
      json: { success: true },
    });
  }

  private async handleList(route: Route): Promise<void> {
    await route.fulfill({
      status: 200,
      json: { success: true, backups: this.backups },
    });
  }

  private createMockBackup(
    type: 'full' | 'incremental',
    provider: MockBackup['provider'] = 'local'
  ): MockBackup {
    const id = `backup-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const dateStr = new Date().toISOString().slice(0, 10);

    return {
      id,
      name: `backup_${dateStr}_${type}.db`,
      type,
      size: type === 'full' ? '25.3 MB' : '5.2 MB',
      date: new Date().toISOString(),
      provider,
      status: 'completed',
    };
  }

  // Control methods for tests
  getBackups(): MockBackup[] {
    return [...this.backups];
  }

  clearBackups(): void {
    this.backups = [];
  }

  addBackup(backup: MockBackup): void {
    this.backups.push(backup);
  }

  addBackups(backups: MockBackup[]): void {
    this.backups.push(...backups);
  }

  setInitialBackups(backups: MockBackup[]): void {
    this.backups = [...backups];
  }

  setShouldFail(fail: boolean): void {
    this.shouldFail = fail;
  }

  setResponseDelay(delayMs: number): void {
    this.responseDelay = delayMs;
  }

  reset(): void {
    this.backups = [];
    this.shouldFail = false;
    this.responseDelay = 0;
  }
}

// Factory for creating mock backups
export function createMockBackup(
  overrides: Partial<MockBackup> = {}
): MockBackup {
  return {
    id: `backup-${Date.now()}`,
    name: 'backup_2024-01-15_full.db',
    type: 'full',
    size: '25.3 MB',
    date: new Date().toISOString(),
    provider: 'local',
    status: 'completed',
    ...overrides,
  };
}

export function createMockBackups(count: number): MockBackup[] {
  return Array.from({ length: count }, (_, i) =>
    createMockBackup({
      id: `backup-${i + 1}`,
      name: `backup_2024-01-${String(i + 1).padStart(2, '0')}_full.db`,
      type: i % 2 === 0 ? 'full' : 'incremental',
    })
  );
}
