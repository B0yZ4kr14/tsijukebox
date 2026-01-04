import { Page, Locator, expect } from '@playwright/test';

export class SettingsPage {
  readonly page: Page;
  
  // Spotify section locators
  readonly spotifySection: Locator;
  readonly spotifyWizardButton: Locator;
  readonly spotifyClientIdInput: Locator;
  readonly spotifyClientSecretInput: Locator;
  readonly spotifyConnectButton: Locator;
  readonly spotifyDisconnectButton: Locator;
  
  // YouTube Music section locators
  readonly youtubeMusicSection: Locator;
  readonly youtubeMusicWizardButton: Locator;
  readonly youtubeMusicClientIdInput: Locator;
  readonly youtubeMusicClientSecretInput: Locator;
  readonly youtubeMusicConnectButton: Locator;
  readonly youtubeMusicDisconnectButton: Locator;
  
  // Wizard dialog locators
  readonly wizardDialog: Locator;
  readonly wizardNextButton: Locator;
  readonly wizardBackButton: Locator;
  readonly wizardCancelButton: Locator;
  readonly wizardFinishButton: Locator;
  readonly wizardProgressBar: Locator;

  // AI Config Section locators
  readonly aiSection: Locator;
  readonly aiFallbackStatusCard: Locator;
  readonly aiTestFallbackButton: Locator;
  readonly aiProviderCards: Locator;
  
  // Per-provider locators
  readonly claudeCard: Locator;
  readonly claudeInput: Locator;
  readonly claudeSaveButton: Locator;
  readonly claudeTestButton: Locator;
  
  readonly openaiCard: Locator;
  readonly openaiInput: Locator;
  readonly openaiSaveButton: Locator;
  readonly openaiTestButton: Locator;
  
  readonly geminiCard: Locator;
  readonly geminiInput: Locator;
  readonly geminiSaveButton: Locator;
  readonly geminiTestButton: Locator;
  
  readonly groqCard: Locator;
  readonly groqInput: Locator;
  readonly groqSaveButton: Locator;
  readonly groqTestButton: Locator;
  
  readonly manusCard: Locator;
  readonly manusInput: Locator;
  readonly manusSaveButton: Locator;
  readonly manusTestButton: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Spotify
    this.spotifySection = page.locator('.card-dark-neon-border').filter({ hasText: 'Spotify' }).first();
    this.spotifyWizardButton = this.spotifySection.getByRole('button', { name: /Configurar com Assistente Guiado/i });
    this.spotifyClientIdInput = this.spotifySection.getByLabel(/Client ID/i);
    this.spotifyClientSecretInput = this.spotifySection.getByLabel(/Client Secret/i);
    this.spotifyConnectButton = this.spotifySection.getByRole('button', { name: /Conectar com Spotify/i });
    this.spotifyDisconnectButton = this.spotifySection.getByRole('button', { name: /Desconectar/i });
    
    // YouTube Music
    this.youtubeMusicSection = page.locator('.card-dark-neon-border').filter({ hasText: 'YouTube Music' });
    this.youtubeMusicWizardButton = this.youtubeMusicSection.getByRole('button', { name: /Configurar com Assistente Guiado/i });
    this.youtubeMusicClientIdInput = this.youtubeMusicSection.getByLabel(/Client ID/i);
    this.youtubeMusicClientSecretInput = this.youtubeMusicSection.getByLabel(/Client Secret/i);
    this.youtubeMusicConnectButton = this.youtubeMusicSection.getByRole('button', { name: /Conectar com Google/i });
    this.youtubeMusicDisconnectButton = this.youtubeMusicSection.getByRole('button', { name: /Desconectar/i });
    
    // Wizard dialog
    this.wizardDialog = page.getByRole('dialog');
    this.wizardNextButton = this.wizardDialog.getByRole('button', { name: /Próximo/i });
    this.wizardBackButton = this.wizardDialog.getByRole('button', { name: /Voltar/i });
    this.wizardCancelButton = this.wizardDialog.getByRole('button', { name: /Cancelar/i });
    this.wizardFinishButton = this.wizardDialog.getByRole('button', { name: /Finalizar/i });
    this.wizardProgressBar = this.wizardDialog.locator('[role="progressbar"]');

    // AI Config Section
    this.aiSection = page.locator('text=Configuração de APIs de IA').locator('..');
    this.aiFallbackStatusCard = page.getByTestId('ai-fallback-status');
    this.aiTestFallbackButton = page.getByTestId('ai-test-fallback');
    this.aiProviderCards = page.locator('[data-testid^="ai-provider-"]');
    
    // Claude
    this.claudeCard = page.getByTestId('ai-provider-anthropic_claude_opus');
    this.claudeInput = page.getByTestId('ai-apikey-input-anthropic_claude_opus');
    this.claudeSaveButton = page.getByTestId('ai-save-anthropic_claude_opus');
    this.claudeTestButton = page.getByTestId('ai-test-anthropic_claude_opus');
    
    // OpenAI
    this.openaiCard = page.getByTestId('ai-provider-openai_api_key');
    this.openaiInput = page.getByTestId('ai-apikey-input-openai_api_key');
    this.openaiSaveButton = page.getByTestId('ai-save-openai_api_key');
    this.openaiTestButton = page.getByTestId('ai-test-openai_api_key');
    
    // Gemini
    this.geminiCard = page.getByTestId('ai-provider-gemini_api_key');
    this.geminiInput = page.getByTestId('ai-apikey-input-gemini_api_key');
    this.geminiSaveButton = page.getByTestId('ai-save-gemini_api_key');
    this.geminiTestButton = page.getByTestId('ai-test-gemini_api_key');
    
    // Groq
    this.groqCard = page.getByTestId('ai-provider-groq_api_key');
    this.groqInput = page.getByTestId('ai-apikey-input-groq_api_key');
    this.groqSaveButton = page.getByTestId('ai-save-groq_api_key');
    this.groqTestButton = page.getByTestId('ai-test-groq_api_key');
    
    // Manus
    this.manusCard = page.getByTestId('ai-provider-manus_api_key');
    this.manusInput = page.getByTestId('ai-apikey-input-manus_api_key');
    this.manusSaveButton = page.getByTestId('ai-save-manus_api_key');
    this.manusTestButton = page.getByTestId('ai-test-manus_api_key');
  }

  async goto() {
    await this.page.goto('/settings');
    await this.page.waitForLoadState('networkidle');
  }

  async scrollToAISection() {
    await this.aiFallbackStatusCard.scrollIntoViewIfNeeded();
  }

  async openSpotifyWizard() {
    const isVisible = await this.spotifyWizardButton.isVisible().catch(() => false);
    if (!isVisible) {
      throw new Error('Spotify wizard button not visible - may already be connected');
    }
    await this.spotifyWizardButton.click();
    await expect(this.wizardDialog).toBeVisible();
  }

  async openYouTubeMusicWizard() {
    const isVisible = await this.youtubeMusicWizardButton.isVisible().catch(() => false);
    if (!isVisible) {
      throw new Error('YouTube Music wizard button not visible - may already be connected');
    }
    await this.youtubeMusicWizardButton.click();
    await expect(this.wizardDialog).toBeVisible();
  }

  async fillSpotifyCredentials(clientId: string, clientSecret: string) {
    await this.spotifyClientIdInput.fill(clientId);
    await this.spotifyClientSecretInput.fill(clientSecret);
  }

  async fillYouTubeMusicCredentials(clientId: string, clientSecret: string) {
    await this.youtubeMusicClientIdInput.fill(clientId);
    await this.youtubeMusicClientSecretInput.fill(clientSecret);
  }

  async navigateWizardToStep(targetStep: number, checkboxLabels: string[] = []) {
    for (let i = 0; i < targetStep; i++) {
      // Check any required checkbox for current step
      if (checkboxLabels[i]) {
        const checkbox = this.wizardDialog.getByLabel(new RegExp(checkboxLabels[i], 'i'));
        await checkbox.check();
      }
      await this.wizardNextButton.click();
    }
  }

  async completeSpotifyWizard(clientId: string, clientSecret: string) {
    await this.openSpotifyWizard();
    
    const checkboxes = [
      '', // Step 1: No checkbox
      'Já estou logado', // Step 2
      'Aplicativo criado', // Step 3
      'URI adicionada', // Step 4
    ];
    
    await this.navigateWizardToStep(4, checkboxes);
    
    // Fill credentials in step 5
    await this.wizardDialog.getByLabel(/Client ID/i).fill(clientId);
    await this.wizardDialog.getByLabel(/Client Secret/i).fill(clientSecret);
    
    await this.wizardFinishButton.click();
    await expect(this.wizardDialog).not.toBeVisible();
  }

  async completeYouTubeMusicWizard(clientId: string, clientSecret: string) {
    await this.openYouTubeMusicWizard();
    
    const checkboxes = [
      '', // Step 1: No checkbox
      'Já estou logado', // Step 2
      'Projeto criado', // Step 3
      'URI', // Step 4
    ];
    
    await this.navigateWizardToStep(4, checkboxes);
    
    // Fill credentials in step 5
    await this.wizardDialog.getByLabel(/Client ID/i).fill(clientId);
    await this.wizardDialog.getByLabel(/Client Secret/i).fill(clientSecret);
    
    await this.wizardFinishButton.click();
    await expect(this.wizardDialog).not.toBeVisible();
  }

  async closeWizard() {
    await this.wizardCancelButton.click();
    await expect(this.wizardDialog).not.toBeVisible();
  }

  async isSpotifyConnected(): Promise<boolean> {
    const connectedBadge = this.spotifySection.locator('text=Conectado');
    return connectedBadge.isVisible().catch(() => false);
  }

  async isYouTubeMusicConnected(): Promise<boolean> {
    const connectedBadge = this.youtubeMusicSection.locator('text=Conectado');
    return connectedBadge.isVisible().catch(() => false);
  }

  // AI Provider methods
  async testFallback() {
    await this.scrollToAISection();
    await this.aiTestFallbackButton.click();
  }

  async enterApiKey(provider: 'claude' | 'openai' | 'gemini' | 'groq' | 'manus', key: string) {
    const inputs = {
      claude: this.claudeInput,
      openai: this.openaiInput,
      gemini: this.geminiInput,
      groq: this.groqInput,
      manus: this.manusInput
    };
    await inputs[provider].fill(key);
  }

  async saveApiKey(provider: 'claude' | 'openai' | 'gemini' | 'groq' | 'manus') {
    const buttons = {
      claude: this.claudeSaveButton,
      openai: this.openaiSaveButton,
      gemini: this.geminiSaveButton,
      groq: this.groqSaveButton,
      manus: this.manusSaveButton
    };
    await buttons[provider].click();
  }

  async testApiKey(provider: 'claude' | 'openai' | 'gemini' | 'groq' | 'manus') {
    const buttons = {
      claude: this.claudeTestButton,
      openai: this.openaiTestButton,
      gemini: this.geminiTestButton,
      groq: this.groqTestButton,
      manus: this.manusTestButton
    };
    await buttons[provider].click();
  }

  async getProviderCount(): Promise<number> {
    return this.aiProviderCards.count();
  }

  async isProviderConfigured(provider: 'claude' | 'openai' | 'gemini' | 'groq' | 'manus'): Promise<boolean> {
    const testIds = {
      claude: 'ai-status-anthropic_claude_opus-configured',
      openai: 'ai-status-openai_api_key-configured',
      gemini: 'ai-status-gemini_api_key-configured',
      groq: 'ai-status-groq_api_key-configured',
      manus: 'ai-status-manus_api_key-configured'
    };
    const badge = this.page.getByTestId(testIds[provider]);
    return badge.isVisible().catch(() => false);
  }

  async isProviderAvailable(provider: 'claude' | 'openai' | 'gemini' | 'groq' | 'manus'): Promise<boolean> {
    const testIds = {
      claude: 'ai-status-anthropic_claude_opus-available',
      openai: 'ai-status-openai_api_key-available',
      gemini: 'ai-status-gemini_api_key-available',
      groq: 'ai-status-groq_api_key-available',
      manus: 'ai-status-manus_api_key-available'
    };
    const badge = this.page.getByTestId(testIds[provider]);
    return badge.isVisible().catch(() => false);
  }
}

export async function createSettingsPage(page: Page): Promise<SettingsPage> {
  const settingsPage = new SettingsPage(page);
  await settingsPage.goto();
  return settingsPage;
}
