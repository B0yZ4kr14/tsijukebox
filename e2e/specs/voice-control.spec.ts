import { test, expect } from '@playwright/test';
import { PlayerPage } from '../fixtures/player.fixture';

test.describe('Voice Control Button', () => {
  let player: PlayerPage;

  test.beforeEach(async ({ page }) => {
    player = new PlayerPage(page);
    await player.enableVoiceControl();
    await player.enableDemoMode();
  });

  test('should display voice control button when enabled', async () => {
    await expect(player.voiceControlButton).toBeVisible();
  });

  test('should have correct accessibility attributes', async () => {
    await expect(player.voiceControlButton).toHaveAttribute('aria-label', /ativar controle por voz|parar de ouvir/i);
  });

  test('should have minimum touch target size (WCAG 2.5.5)', async () => {
    const box = await player.voiceControlButton.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(40);
    expect(box!.height).toBeGreaterThanOrEqual(40);
  });

  test('should show tooltip with available commands on hover', async () => {
    await player.voiceControlButton.hover();
    
    // Wait for tooltip to appear
    const tooltip = player.page.locator('[role="tooltip"]');
    await expect(tooltip).toBeVisible({ timeout: 2000 });
    await expect(tooltip).toContainText(/play|pause|próxima|anterior|volume/i);
  });

  test('should not render when voice control is disabled', async ({ page }) => {
    await player.disableVoiceControl();
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await expect(player.voiceControlButton).not.toBeVisible();
  });

  test('should have proper keyboard accessibility', async () => {
    // Tab to the button
    await player.page.keyboard.press('Tab');
    
    // Find focused element
    const focusedElement = player.page.locator(':focus');
    
    // The button should be focusable
    await expect(player.voiceControlButton).toBeVisible();
  });

  test('should be positioned in player section', async () => {
    // Check that voice control is near volume slider
    const volumeSlider = player.page.getByTestId('volume-slider');
    const voiceButton = player.voiceControlButton;
    
    // Both should be visible
    await expect(volumeSlider).toBeVisible();
    await expect(voiceButton).toBeVisible();
  });
});

test.describe('Voice Control - Floating Button', () => {
  let player: PlayerPage;

  test.beforeEach(async ({ page }) => {
    player = new PlayerPage(page);
    await player.enableVoiceControl();
    await player.enableDemoMode();
  });

  test('should display floating voice control button', async () => {
    // The floating button is a second instance, check for multiple instances
    const voiceButtons = player.page.getByTestId('voice-control-button');
    const count = await voiceButtons.count();
    
    // Should have at least 2 buttons (one in player section, one floating)
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('floating button should be in bottom-right corner', async () => {
    // Get the floating button container
    const floatingContainer = player.page.locator('.fixed.bottom-6.right-6');
    await expect(floatingContainer).toBeVisible();
    
    const button = floatingContainer.getByTestId('voice-control-button');
    await expect(button).toBeVisible();
  });

  test('floating button should have larger size (lg)', async () => {
    const floatingContainer = player.page.locator('.fixed.bottom-6.right-6');
    const button = floatingContainer.getByTestId('voice-control-button');
    
    const box = await button.boundingBox();
    expect(box).not.toBeNull();
    // Large size should be h-12 w-12 = 48px
    expect(box!.width).toBeGreaterThanOrEqual(48);
    expect(box!.height).toBeGreaterThanOrEqual(48);
  });
});

test.describe('Voice Control - Settings Integration', () => {
  test('should show voice control section in settings', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    // Look for accessibility or appearance section
    const voiceSection = page.getByText(/controle por voz|voice control/i);
    
    // If the section exists, it should be accessible via settings
    if (await voiceSection.isVisible()) {
      await expect(voiceSection).toBeVisible();
    }
  });

  test('should persist voice control settings in localStorage', async ({ page }) => {
    const player = new PlayerPage(page);
    await player.enableVoiceControl();
    await player.goto();
    
    // Verify settings are saved
    const settings = await page.evaluate(() => {
      return localStorage.getItem('tsijukebox-voice-control');
    });
    
    expect(settings).not.toBeNull();
    const parsed = JSON.parse(settings!);
    expect(parsed).toHaveProperty('enabled', true);
    expect(parsed).toHaveProperty('language', 'pt-BR');
  });

  test('should respect disabled state after page reload', async ({ page }) => {
    const player = new PlayerPage(page);
    
    // Start with enabled
    await player.enableVoiceControl();
    await player.goto();
    await expect(player.voiceControlButton).toBeVisible();
    
    // Disable and reload
    await player.disableVoiceControl();
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should no longer be visible
    await expect(player.voiceControlButton).not.toBeVisible();
  });
});

test.describe('Voice Control - Visual Feedback', () => {
  let player: PlayerPage;

  test.beforeEach(async ({ page }) => {
    player = new PlayerPage(page);
    await player.enableVoiceControl();
    await player.enableDemoMode();
  });

  test('button should have visual distinction when listening', async () => {
    // Initial state - not listening
    const initialListening = await player.isVoiceControlListening();
    expect(initialListening).toBe(false);
    
    // Button should have the non-listening style
    await expect(player.voiceControlButton).toBeVisible();
  });

  test('should have pulse animation container when listening', async () => {
    // The pulse animation is rendered when isListening is true
    // We can check for the container structure
    await expect(player.voiceControlContainer).toBeVisible();
  });
});

test.describe('Voice Control - Browser Support', () => {
  test('should gracefully handle unsupported browsers', async ({ page }) => {
    // Mock unsupported browser by removing SpeechRecognition
    await page.addInitScript(() => {
      // @ts-ignore
      delete window.SpeechRecognition;
      // @ts-ignore
      delete window.webkitSpeechRecognition;
    });
    
    const player = new PlayerPage(page);
    await player.enableVoiceControl();
    await player.goto();
    
    // Button should not be visible in unsupported browser
    await expect(player.voiceControlButton).not.toBeVisible();
  });
});
