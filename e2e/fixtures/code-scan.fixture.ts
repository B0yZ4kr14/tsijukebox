import { Locator, Page, expect } from '@playwright/test';

export class CodeScanFixture {
  readonly page: Page;
  
  // Main section
  readonly codeScanSection: Locator;
  
  // Input fields
  readonly fileNameInput: Locator;
  readonly codeInput: Locator;
  
  // Buttons
  readonly submitButton: Locator;
  readonly exportButton: Locator;
  readonly clearButton: Locator;
  
  // Progress & Status
  readonly progressBar: Locator;
  readonly errorDisplay: Locator;
  
  // Summary
  readonly summaryCard: Locator;
  readonly filesCount: Locator;
  readonly issuesCount: Locator;
  readonly criticalCount: Locator;
  readonly scoreDisplay: Locator;
  
  // Results
  readonly resultsContainer: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Main section
    this.codeScanSection = page.getByTestId('codescan-section');
    
    // Input fields - corrected testids
    this.fileNameInput = page.getByTestId('codescan-filename-input');
    this.codeInput = page.getByTestId('codescan-code-input');
    
    // Buttons - corrected testids
    this.submitButton = page.getByTestId('codescan-submit-button');
    this.exportButton = page.getByTestId('codescan-export-button');
    this.clearButton = page.getByTestId('codescan-clear-button');
    
    // Progress & Status
    this.progressBar = page.getByTestId('codescan-progress');
    this.errorDisplay = page.getByTestId('codescan-error');
    
    // Summary - corrected testids
    this.summaryCard = page.getByTestId('codescan-summary');
    this.filesCount = page.getByTestId('codescan-files-count');
    this.issuesCount = page.getByTestId('codescan-issues-count');
    this.criticalCount = page.getByTestId('codescan-critical-count');
    this.scoreDisplay = page.getByTestId('codescan-score-display');
    
    // Results - corrected testid
    this.resultsContainer = page.getByTestId('codescan-results');
  }

  async navigateToSettings() {
    await this.page.goto('/settings');
    await this.page.waitForLoadState('networkidle');
  }

  async scrollToCodeScanSection() {
    await this.codeScanSection.scrollIntoViewIfNeeded();
  }

  async fillCodeInput(code: string) {
    await this.codeInput.fill(code);
  }

  async fillFileName(fileName: string) {
    await this.fileNameInput.fill(fileName);
  }

  async submitCodeForScan(code: string, fileName: string = 'test.ts') {
    await this.fillFileName(fileName);
    await this.fillCodeInput(code);
    await this.submitButton.click();
  }

  async waitForScanComplete(timeout = 30000) {
    // Wait for progress bar to appear (optional, may be too fast)
    await this.progressBar.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    
    // Wait for results or error to appear
    await Promise.race([
      this.resultsContainer.waitFor({ state: 'visible', timeout }),
      this.errorDisplay.waitFor({ state: 'visible', timeout })
    ]).catch(() => {});
  }

  async getScanScore(): Promise<number> {
    const scoreText = await this.scoreDisplay.textContent();
    return parseInt(scoreText?.replace(/[^0-9]/g, '') || '0', 10);
  }

  async getFilesCount(): Promise<number> {
    const text = await this.filesCount.textContent();
    return parseInt(text?.replace(/[^0-9]/g, '') || '0', 10);
  }

  async getIssuesCount(): Promise<number> {
    const text = await this.issuesCount.textContent();
    return parseInt(text?.replace(/[^0-9]/g, '') || '0', 10);
  }

  async getCriticalCount(): Promise<number> {
    const text = await this.criticalCount.textContent();
    return parseInt(text?.replace(/[^0-9]/g, '') || '0', 10);
  }

  async getFileResults(): Promise<Locator> {
    return this.page.locator('[data-testid^="codescan-file-"]');
  }

  async getIssueItems(): Promise<Locator> {
    return this.page.locator('[data-testid^="codescan-issue-"]');
  }

  async expandFile(fileName: string) {
    const fileCollapsible = this.page.getByTestId(`codescan-file-${fileName}`);
    await fileCollapsible.click();
  }

  async exportResults() {
    await this.exportButton.click();
  }

  async clearResults() {
    await this.clearButton.click();
  }

  async isSubmitButtonDisabled(): Promise<boolean> {
    return this.submitButton.isDisabled();
  }

  async isSubmitButtonEnabled(): Promise<boolean> {
    return !(await this.submitButton.isDisabled());
  }

  async hasError(): Promise<boolean> {
    return this.errorDisplay.isVisible();
  }

  async hasResults(): Promise<boolean> {
    return this.resultsContainer.isVisible();
  }

  async hasSummary(): Promise<boolean> {
    return this.summaryCard.isVisible();
  }
}

export async function createCodeScanPage(page: Page): Promise<CodeScanFixture> {
  const codeScanPage = new CodeScanFixture(page);
  await codeScanPage.navigateToSettings();
  await codeScanPage.scrollToCodeScanSection();
  return codeScanPage;
}
