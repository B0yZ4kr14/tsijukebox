import { Locator, Page, expect } from '@playwright/test';

export class CodeScanFixture {
  readonly page: Page;
  
  // Main section
  readonly codeScanSection: Locator;
  
  // Input fields
  readonly fileNameInput: Locator;
  readonly codeInput: Locator;
  
  // Form Structure
  readonly inputSection: Locator;
  readonly fileNameLabel: Locator;
  readonly codeLabel: Locator;
  readonly actionsContainer: Locator;
  
  // Buttons
  readonly submitButton: Locator;
  readonly exportButton: Locator;
  readonly clearButton: Locator;
  
  // Progress & Status
  readonly progressBar: Locator;
  readonly errorDisplay: Locator;
  readonly loadingSpinner: Locator;
  readonly progressValue: Locator;
  readonly progressBarElement: Locator;
  
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
    
    // Input fields
    this.fileNameInput = page.getByTestId('codescan-filename-input');
    this.codeInput = page.getByTestId('codescan-code-input');
    
    // Form Structure
    this.inputSection = page.getByTestId('codescan-input-section');
    this.fileNameLabel = page.getByTestId('codescan-filename-label');
    this.codeLabel = page.getByTestId('codescan-code-label');
    this.actionsContainer = page.getByTestId('codescan-actions');
    
    // Buttons
    this.submitButton = page.getByTestId('codescan-submit-button');
    this.exportButton = page.getByTestId('codescan-export-button');
    this.clearButton = page.getByTestId('codescan-clear-button');
    
    // Progress & Status
    this.progressBar = page.getByTestId('codescan-progress');
    this.errorDisplay = page.getByTestId('codescan-error');
    this.loadingSpinner = page.getByTestId('codescan-loading-spinner');
    this.progressValue = page.getByTestId('codescan-progress-value');
    this.progressBarElement = page.getByTestId('codescan-progress-bar');
    
    // Summary
    this.summaryCard = page.getByTestId('codescan-summary');
    this.filesCount = page.getByTestId('codescan-files-count');
    this.issuesCount = page.getByTestId('codescan-issues-count');
    this.criticalCount = page.getByTestId('codescan-critical-count');
    this.scoreDisplay = page.getByTestId('codescan-score-display');
    
    // Results
    this.resultsContainer = page.getByTestId('codescan-results');
  }

  // Navigation
  async navigateToSettings() {
    await this.page.goto('/settings');
    await this.page.waitForLoadState('networkidle');
  }

  async scrollToCodeScanSection() {
    await this.codeScanSection.scrollIntoViewIfNeeded();
  }

  // Input methods
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

  // Wait methods
  async waitForScanComplete(timeout = 30000) {
    await this.progressBar.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    await Promise.race([
      this.resultsContainer.waitFor({ state: 'visible', timeout }),
      this.errorDisplay.waitFor({ state: 'visible', timeout })
    ]).catch(() => {});
  }

  async waitForLoading(timeout = 5000) {
    await this.loadingSpinner.waitFor({ state: 'visible', timeout });
  }

  async waitForLoadingComplete(timeout = 30000) {
    await this.loadingSpinner.waitFor({ state: 'hidden', timeout });
  }

  // Loading state helpers
  async isLoading(): Promise<boolean> {
    return this.loadingSpinner.isVisible();
  }

  async getProgressPercentage(): Promise<number> {
    const text = await this.progressValue.textContent();
    return parseInt(text?.replace(/[^0-9]/g, '') || '0', 10);
  }

  // Summary data getters
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

  // Dynamic locators for file results
  getFileResults(): Locator {
    return this.page.locator('[data-testid^="codescan-file-"]');
  }

  getIssueItems(): Locator {
    return this.page.locator('[data-testid^="codescan-issue-"]');
  }

  getFileIssuesBadge(fileName: string): Locator {
    return this.page.getByTestId(`codescan-issues-badge-${fileName}`);
  }

  getFileSummary(fileName: string): Locator {
    return this.page.getByTestId(`codescan-file-summary-${fileName}`);
  }

  getFileScore(fileName: string): Locator {
    return this.page.getByTestId(`codescan-score-${fileName}`);
  }

  // Dynamic locators for issue details
  getIssueSeverity(fileName: string, idx: number): Locator {
    return this.page.getByTestId(`codescan-severity-${fileName}-${idx}`);
  }

  getIssueCategory(fileName: string, idx: number): Locator {
    return this.page.getByTestId(`codescan-category-${fileName}-${idx}`);
  }

  getIssueLine(fileName: string, idx: number): Locator {
    return this.page.getByTestId(`codescan-line-${fileName}-${idx}`);
  }

  getIssueTitle(fileName: string, idx: number): Locator {
    return this.page.getByTestId(`codescan-issue-title-${fileName}-${idx}`);
  }

  getIssueMessage(fileName: string, idx: number): Locator {
    return this.page.getByTestId(`codescan-issue-message-${fileName}-${idx}`);
  }

  getIssueSuggestion(fileName: string, idx: number): Locator {
    return this.page.getByTestId(`codescan-suggestion-${fileName}-${idx}`);
  }

  // Helper to get all issue details at once
  async getIssueDetails(fileName: string, idx: number) {
    const suggestionLocator = this.getIssueSuggestion(fileName, idx);
    const hasSuggestion = await suggestionLocator.isVisible();
    
    return {
      severity: await this.getIssueSeverity(fileName, idx).textContent(),
      category: await this.getIssueCategory(fileName, idx).textContent(),
      line: await this.getIssueLine(fileName, idx).textContent(),
      title: await this.getIssueTitle(fileName, idx).textContent(),
      message: await this.getIssueMessage(fileName, idx).textContent(),
      suggestion: hasSuggestion ? await suggestionLocator.textContent() : null,
    };
  }

  // File actions
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

  // State checks
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
