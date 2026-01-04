import { test, expect } from '@playwright/test';
import { SettingsPage, createSettingsPage } from '../fixtures/settings.fixture';

test.describe('AI Providers Configuration', () => {
  let settingsPage: SettingsPage;

  test.beforeEach(async ({ page }) => {
    settingsPage = await createSettingsPage(page);
    // Wait for AI section to be fully loaded
    await page.waitForTimeout(500);
  });

  test('should display AI configuration section', async ({ page }) => {
    // Look for the AI section heading
    const aiSectionTitle = page.getByText('Configuração de APIs de IA');
    await expect(aiSectionTitle).toBeVisible();
  });

  test('should display fallback status card', async ({ page }) => {
    const fallbackCard = page.getByTestId('ai-fallback-status');
    await expect(fallbackCard).toBeVisible();
    
    // Check for fallback system text
    await expect(page.getByText('Sistema de Fallback')).toBeVisible();
  });

  test('should have test fallback button', async ({ page }) => {
    const testFallbackBtn = page.getByTestId('ai-test-fallback');
    await expect(testFallbackBtn).toBeVisible();
    await expect(testFallbackBtn).toContainText('Testar Fallback');
  });

  test('should display all 5 AI providers', async ({ page }) => {
    const providers = [
      { id: 'anthropic_claude_opus', name: 'Claude Opus' },
      { id: 'openai_api_key', name: 'OpenAI GPT-5' },
      { id: 'gemini_api_key', name: 'Google Gemini' },
      { id: 'groq_api_key', name: 'Groq' },
      { id: 'manus_api_key', name: 'Manus.im' }
    ];

    for (const provider of providers) {
      const providerCard = page.getByTestId(`ai-provider-${provider.id}`);
      await expect(providerCard).toBeVisible();
      await expect(providerCard).toContainText(provider.name);
    }
  });

  test('should have API key input for each provider', async ({ page }) => {
    const providerIds = [
      'anthropic_claude_opus',
      'openai_api_key',
      'gemini_api_key',
      'groq_api_key',
      'manus_api_key'
    ];

    for (const id of providerIds) {
      const input = page.getByTestId(`ai-apikey-input-${id}`);
      await expect(input).toBeVisible();
      await expect(input).toHaveAttribute('type', 'password');
    }
  });

  test('should have save button for each provider', async ({ page }) => {
    const providerIds = [
      'anthropic_claude_opus',
      'openai_api_key',
      'gemini_api_key',
      'groq_api_key',
      'manus_api_key'
    ];

    for (const id of providerIds) {
      const saveBtn = page.getByTestId(`ai-save-${id}`);
      await expect(saveBtn).toBeVisible();
    }
  });

  test('should toggle password visibility', async ({ page }) => {
    const input = page.getByTestId('ai-apikey-input-anthropic_claude_opus');
    const toggleBtn = page.getByTestId('ai-toggle-visibility-anthropic_claude_opus');
    
    // Initially password type
    await expect(input).toHaveAttribute('type', 'password');
    
    // Click to show
    await toggleBtn.click();
    await expect(input).toHaveAttribute('type', 'text');
    
    // Click to hide
    await toggleBtn.click();
    await expect(input).toHaveAttribute('type', 'password');
  });

  test('should show provider priority badges', async ({ page }) => {
    // Check priority badges in fallback status card
    const priorityBadges = page.locator('[data-testid="ai-fallback-status"] .text-xs');
    await expect(priorityBadges.first()).toBeVisible();
  });

  test('should display console links for each provider', async ({ page }) => {
    const consoleLinks = [
      { provider: 'anthropic_claude_opus', text: 'Anthropic Console' },
      { provider: 'openai_api_key', text: 'OpenAI Platform' },
      { provider: 'gemini_api_key', text: 'Google AI Studio' },
      { provider: 'groq_api_key', text: 'Groq Console' },
      { provider: 'manus_api_key', text: 'Manus Dashboard' }
    ];

    for (const link of consoleLinks) {
      const providerCard = page.getByTestId(`ai-provider-${link.provider}`);
      const consoleLink = providerCard.getByText(link.text);
      await expect(consoleLink).toBeVisible();
      await expect(consoleLink).toHaveAttribute('target', '_blank');
    }
  });

  test('should validate API key prefix on save attempt', async ({ page }) => {
    // Fill invalid API key (wrong prefix)
    const input = page.getByTestId('ai-apikey-input-anthropic_claude_opus');
    await input.fill('invalid-key-without-prefix');
    
    // Try to save
    const saveBtn = page.getByTestId('ai-save-anthropic_claude_opus');
    await saveBtn.click();
    
    // Should show error toast (key should start with sk-ant-)
    const toast = page.locator('[data-sonner-toast]');
    await expect(toast).toBeVisible({ timeout: 3000 });
  });

  test('should show correct placeholder for each provider', async ({ page }) => {
    const placeholders = [
      { id: 'anthropic_claude_opus', placeholder: 'sk-ant-api03-...' },
      { id: 'openai_api_key', placeholder: 'sk-proj-...' },
      { id: 'gemini_api_key', placeholder: 'AIza...' },
      { id: 'groq_api_key', placeholder: 'gsk_...' },
      { id: 'manus_api_key', placeholder: 'manus_...' }
    ];

    for (const { id, placeholder } of placeholders) {
      const input = page.getByTestId(`ai-apikey-input-${id}`);
      await expect(input).toHaveAttribute('placeholder', placeholder);
    }
  });

  test('save button should be disabled when input is empty', async ({ page }) => {
    const input = page.getByTestId('ai-apikey-input-anthropic_claude_opus');
    const saveBtn = page.getByTestId('ai-save-anthropic_claude_opus');
    
    // Clear input
    await input.clear();
    
    // Button should be disabled
    await expect(saveBtn).toBeDisabled();
  });

  test('save button should be enabled when input has value', async ({ page }) => {
    const input = page.getByTestId('ai-apikey-input-anthropic_claude_opus');
    const saveBtn = page.getByTestId('ai-save-anthropic_claude_opus');
    
    // Fill input
    await input.fill('sk-ant-test-key');
    
    // Button should be enabled
    await expect(saveBtn).toBeEnabled();
  });
});

test.describe('AI Providers - Integration Tests', () => {
  test('should call test fallback endpoint', async ({ page }) => {
    const settingsPage = await createSettingsPage(page);
    
    // Setup request interception
    let fallbackCalled = false;
    page.on('request', request => {
      if (request.url().includes('ai-gateway')) {
        fallbackCalled = true;
      }
    });
    
    // Click test fallback
    const testBtn = page.getByTestId('ai-test-fallback');
    await testBtn.click();
    
    // Wait for request
    await page.waitForTimeout(1000);
    
    // Verify the request was made
    expect(fallbackCalled).toBe(true);
  });
});

test.describe('AI Providers - Accessibility', () => {
  test('should have proper labels for inputs', async ({ page }) => {
    await createSettingsPage(page);
    
    // Check that inputs have associated labels
    const inputs = page.locator('[data-testid^="ai-apikey-input-"]');
    const count = await inputs.count();
    
    expect(count).toBe(5);
    
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      expect(id).toBeTruthy();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await createSettingsPage(page);
    
    // Tab through the page
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should be able to focus on interactive elements
    const activeElement = page.locator(':focus');
    await expect(activeElement).toBeVisible();
  });
});
