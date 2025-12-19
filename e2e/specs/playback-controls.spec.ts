import { test, expect } from '@playwright/test';
import { PlayerPage } from '../fixtures/player.fixture';

test.describe('Playback Controls (Shuffle/Repeat/Queue)', () => {
  let player: PlayerPage;

  test.beforeEach(async ({ page }) => {
    player = new PlayerPage(page);
    await player.enableDemoMode();
  });

  test('should display shuffle, repeat, and queue buttons', async () => {
    await expect(player.shuffleButton).toBeVisible();
    await expect(player.repeatButton).toBeVisible();
    await expect(player.queueButton).toBeVisible();
  });

  test('should toggle shuffle on/off', async ({ page }) => {
    const initialState = await player.isShuffleActive();
    expect(initialState).toBe(false);
    
    await player.toggleShuffle();
    expect(await player.isShuffleActive()).toBe(true);
    
    // Toast notification
    await expect(page.locator('.sonner-toast')).toBeVisible();
    
    await player.toggleShuffle();
    expect(await player.isShuffleActive()).toBe(false);
  });

  test('shuffle button should have visual feedback when active', async () => {
    await player.toggleShuffle();
    
    // Should have green color styling
    await expect(player.shuffleButton).toHaveClass(/text-\[#1DB954\]/);
  });

  test('should cycle through repeat modes: off → context → track → off', async ({ page }) => {
    expect(await player.getRepeatMode()).toBe('off');
    
    await player.toggleRepeat();
    await expect(page.locator('.sonner-toast')).toBeVisible();
    
    await player.toggleRepeat();
    await expect(page.locator('.sonner-toast')).toBeVisible();
    
    await player.toggleRepeat();
    expect(await player.getRepeatMode()).toBe('off');
  });
});
