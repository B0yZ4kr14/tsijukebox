import { test, expect, devices } from '@playwright/test';
import { PlayerPage } from '../fixtures/player.fixture';

test.describe('Player Responsive Layout', () => {
  test('should display full layout on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    
    const player = new PlayerPage(page);
    await player.enableDemoMode();
    
    // All main controls should be visible on desktop
    await expect(player.playPauseButton).toBeVisible();
    await expect(player.nextButton).toBeVisible();
    await expect(player.prevButton).toBeVisible();
    await expect(player.volumeSlider).toBeVisible();
    await expect(player.nowPlaying).toBeVisible();
  });

  test('should adapt layout on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const player = new PlayerPage(page);
    await player.enableDemoMode();
    
    // Core controls should still be visible on mobile
    await expect(player.playPauseButton).toBeVisible();
    await expect(player.nextButton).toBeVisible();
    await expect(player.prevButton).toBeVisible();
  });

  test('should adapt layout on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    const player = new PlayerPage(page);
    await player.enableDemoMode();
    
    // All main controls should be visible on tablet
    await expect(player.playPauseButton).toBeVisible();
    await expect(player.nextButton).toBeVisible();
    await expect(player.prevButton).toBeVisible();
    await expect(player.nowPlaying).toBeVisible();
  });

  test('should maintain touch target sizes on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const player = new PlayerPage(page);
    await player.enableDemoMode();
    
    // Play button should have minimum 44x44 touch target
    const playBox = await player.playPauseButton.boundingBox();
    expect(playBox?.width).toBeGreaterThanOrEqual(44);
    expect(playBox?.height).toBeGreaterThanOrEqual(44);
    
    // Next button should have minimum touch target
    const nextBox = await player.nextButton.boundingBox();
    expect(nextBox?.width).toBeGreaterThanOrEqual(44);
    expect(nextBox?.height).toBeGreaterThanOrEqual(44);
  });

  test('should handle orientation change', async ({ page }) => {
    // Start in portrait
    await page.setViewportSize({ width: 375, height: 667 });
    
    const player = new PlayerPage(page);
    await player.enableDemoMode();
    
    await expect(player.playPauseButton).toBeVisible();
    
    // Switch to landscape
    await page.setViewportSize({ width: 667, height: 375 });
    
    // Controls should still be visible
    await expect(player.playPauseButton).toBeVisible();
    await expect(player.nextButton).toBeVisible();
  });
});
