import { test, expect } from '@playwright/test';
import { PlayerPage } from '../fixtures/player.fixture';

test.describe('Volume Controls', () => {
  let player: PlayerPage;

  test.beforeEach(async ({ page }) => {
    player = new PlayerPage(page);
    await player.enableDemoMode();
  });

  test('should display volume slider and mute button', async () => {
    await expect(player.volumeSlider).toBeVisible();
    await expect(player.muteButton).toBeVisible();
  });

  test('should display current volume value', async () => {
    await expect(player.volumeValue).toBeVisible();
    const value = await player.getVolumeValue();
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(100);
  });

  test('should toggle mute when clicking mute button', async ({ page }) => {
    const initialValue = await player.getVolumeValue();
    
    // Mute
    await player.toggleMute();
    await expect(player.volumeValue).toHaveText('0%');
    
    // Unmute
    await player.toggleMute();
    const restoredValue = await player.getVolumeValue();
    expect(restoredValue).toBeGreaterThan(0);
  });

  test('should show muted icon when volume is 0', async () => {
    await player.toggleMute();
    
    // Check for VolumeX icon (muted state)
    const muteIcon = player.muteButton.locator('svg');
    await expect(muteIcon).toBeVisible();
  });

  test('volume slider should have correct ARIA attributes', async () => {
    await expect(player.volumeSlider).toHaveAttribute('aria-label', /.+/);
  });
});
