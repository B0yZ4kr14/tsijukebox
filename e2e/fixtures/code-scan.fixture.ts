import { Locator, Page, expect } from '@playwright/test';

export class CodeScanFixture {
  readonly page: Page;
  readonly settingsLink: Locator;
  readonly codeScanSection: Locator;
  readonly codeInput: Locator;
  readonly fileNameInput: Locator;
  readonly scanButton: Locator;
  readonly progressBar: Locator;
  readonly resultsContainer: Locator;
  readonly issuesList: Locator;
  readonly scoreDisplay: Locator;
  readonly summaryCard: Locator;
  readonly historySection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.settingsLink = page.getByRole('link', { name: /settings/i });
    this.codeScanSection = page.getByTestId('code-scan-section');
    this.codeInput = page.getByTestId('code-input');
    this.fileNameInput = page.getByTestId('file-name-input');
    this.scanButton = page.getByTestId('scan-button');
    this.progressBar = page.getByTestId('scan-progress');
    this.resultsContainer = page.getByTestId('scan-results');
    this.issuesList = page.getByTestId('issues-list');
    this.scoreDisplay = page.getByTestId('scan-score');
    this.summaryCard = page.getByTestId('scan-summary');
    this.historySection = page.getByTestId('scan-history');
  }

  async navigateToSettings() {
    await this.page.goto('/settings');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToCodeScanSection() {
    await this.navigateToSettings();
    // Navigate to code scan section - may need to click on security category
    const securityTab = this.page.getByText('Segurança');
    if (await securityTab.isVisible()) {
      await securityTab.click();
    }
  }

  async submitCodeForScan(code: string, fileName: string) {
    if (await this.codeInput.isVisible()) {
      await this.codeInput.fill(code);
    }
    if (await this.fileNameInput.isVisible()) {
      await this.fileNameInput.fill(fileName);
    }
    await this.scanButton.click();
  }

  async waitForScanComplete(timeout = 30000) {
    // Wait for progress bar to appear and then disappear
    await this.page.waitForSelector('[data-testid="scan-progress"]', { 
      state: 'visible',
      timeout: 5000 
    }).catch(() => {
      // Progress may be too fast to catch
    });
    
    // Wait for results to appear
    await this.page.waitForSelector('[data-testid="scan-results"]', { 
      state: 'visible',
      timeout 
    });
  }

  async getScanScore(): Promise<number> {
    const scoreText = await this.scoreDisplay.textContent();
    return parseInt(scoreText?.replace(/[^0-9]/g, '') || '0', 10);
  }

  async getIssuesBySeverity(severity: 'critical' | 'high' | 'medium' | 'low'): Promise<number> {
    const severityBadge = this.page.getByTestId(`issues-${severity}`);
    if (!(await severityBadge.isVisible())) return 0;
    
    const text = await severityBadge.textContent();
    return parseInt(text?.replace(/[^0-9]/g, '') || '0', 10);
  }

  async getTotalIssues(): Promise<number> {
    const items = this.page.locator('[data-testid^="issue-item-"]');
    return items.count();
  }

  async getScanHistoryCount(): Promise<number> {
    const historyItems = this.page.locator('[data-testid^="history-item-"]');
    return historyItems.count();
  }

  async clickHistoryItem(index: number) {
    const historyItems = this.page.locator('[data-testid^="history-item-"]');
    await historyItems.nth(index).click();
  }

  async waitForToast(message: string, timeout = 5000) {
    await this.page.waitForSelector(`text="${message}"`, { timeout });
  }
}