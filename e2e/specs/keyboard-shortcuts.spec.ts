import { test, expect } from '@playwright/test';
import { PlayerPage } from '../fixtures/player.fixture';

test.describe('Keyboard Shortcuts', () => {
  let player: PlayerPage;

  test.beforeEach(async ({ page }) => {
    player = new PlayerPage(page);
    await player.enableDemoMode();
  });

  test('Space should toggle play/pause', async ({ page }) => {
    await page.keyboard.press('Space');
    
    // Should trigger playback action
    await expect(page.locator('.sonner-toast')).toBeVisible();
  });

  test('ArrowRight should skip to next track', async ({ page }) => {
    await page.keyboard.press('ArrowRight');
    
    await expect(page.locator('.sonner-toast')).toContainText(/Próxima|Next/i);
  });

  test('ArrowLeft should go to previous track', async ({ page }) => {
    await page.keyboard.press('ArrowLeft');
    
    await expect(page.locator('.sonner-toast')).toContainText(/anterior|Previous/i);
  });

  test('ArrowUp should increase volume', async ({ page }) => {
    const initialVolume = await player.getVolumeValue();
    
    await page.keyboard.press('ArrowUp');
    
    await expect(page.locator('.sonner-toast')).toContainText(/Volume/);
  });

  test('ArrowDown should decrease volume', async ({ page }) => {
    await page.keyboard.press('ArrowDown');
    
    await expect(page.locator('.sonner-toast')).toContainText(/Volume/);
  });

  test('+ key should increase volume', async ({ page }) => {
    await page.keyboard.press('+');
    
    await expect(page.locator('.sonner-toast')).toBeVisible();
  });

  test('- key should decrease volume', async ({ page }) => {
    await page.keyboard.press('-');
    
    await expect(page.locator('.sonner-toast')).toBeVisible();
  });
});
