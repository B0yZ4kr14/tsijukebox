import { test, expect } from '@playwright/test';
import { PlayerPage } from '../fixtures/player.fixture';

test.describe('Player Controls', () => {
  let player: PlayerPage;

  test.beforeEach(async ({ page }) => {
    player = new PlayerPage(page);
    await player.enableDemoMode();
  });

  test('should display all player control buttons', async () => {
    await expect(player.playPauseButton).toBeVisible();
    await expect(player.nextButton).toBeVisible();
    await expect(player.prevButton).toBeVisible();
    await expect(player.stopButton).toBeVisible();
  });

  test('should toggle play/pause when clicking button', async ({ page }) => {
    // Click play
    await player.play();
    
    // Verify toast appears
    await expect(page.locator('.sonner-toast')).toBeVisible();
    
    // Click pause
    await player.pause();
    
    // Verify state changed
    await expect(page.locator('.sonner-toast')).toBeVisible();
  });

  test('should go to next track when clicking next button', async ({ page }) => {
    await player.next();
    
    // Toast should appear
    await expect(page.locator('.sonner-toast')).toContainText(/Próxima|Next/i);
  });

  test('should go to previous track when clicking prev button', async ({ page }) => {
    await player.prev();
    
    // Toast should appear
    await expect(page.locator('.sonner-toast')).toContainText(/anterior|Previous/i);
  });

  test('should stop playback when clicking stop button', async ({ page }) => {
    await player.play();
    await player.stop();
    
    // Verify playback stopped
    await expect(page.locator('.sonner-toast')).toBeVisible();
  });

  test('buttons should have correct aria-labels for accessibility', async () => {
    await expect(player.playPauseButton).toHaveAttribute('aria-label', /.+/);
    await expect(player.nextButton).toHaveAttribute('aria-label', /.+/);
    await expect(player.prevButton).toHaveAttribute('aria-label', /.+/);
    await expect(player.stopButton).toHaveAttribute('aria-label', /.+/);
  });

  test('play/pause button should have minimum 44x44 touch target size', async () => {
    const box = await player.playPauseButton.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });
});
