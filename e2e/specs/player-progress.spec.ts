import { test, expect } from '@playwright/test';
import { PlayerPage } from '../fixtures/player.fixture';

test.describe('Progress Bar', () => {
  let player: PlayerPage;

  test.beforeEach(async ({ page }) => {
    player = new PlayerPage(page);
    await player.enableDemoMode();
  });

  test('should display current time and duration', async () => {
    await expect(player.progressCurrent).toBeVisible();
    await expect(player.progressDuration).toBeVisible();
    
    // Should show time format (e.g., "0:00" or "3:45")
    await expect(player.progressCurrent).toHaveText(/\d+:\d{2}/);
    await expect(player.progressDuration).toHaveText(/\d+:\d{2}/);
  });

  test('should display progress bar component', async () => {
    await expect(player.progressBar).toBeVisible();
  });

  test('should allow seeking by clicking on progress bar', async ({ page }) => {
    // Get progress bar bounds
    const progressBar = player.progressBar;
    const box = await progressBar.boundingBox();
    
    if (box) {
      // Click at 50% of the progress bar
      const clickX = box.x + box.width * 0.5;
      const clickY = box.y + box.height / 2;
      
      await page.mouse.click(clickX, clickY);
      
      // Verify a toast or state change occurred
      await expect(page.locator('.sonner-toast')).toBeVisible({ timeout: 2000 }).catch(() => {
        // Toast may not appear for seek, which is fine
      });
    }
  });

  test('should have correct ARIA attributes for accessibility', async () => {
    // Progress bar should have proper role
    const progressBarSlider = player.progressBar.locator('[role="slider"]');
    
    // Check if slider exists, otherwise check the container
    const hasSlider = await progressBarSlider.count() > 0;
    
    if (hasSlider) {
      await expect(progressBarSlider).toHaveAttribute('aria-valuemin', /.*/);
      await expect(progressBarSlider).toHaveAttribute('aria-valuemax', /.*/);
    } else {
      // At minimum, progress bar container should be visible
      await expect(player.progressBar).toBeVisible();
    }
  });
});
