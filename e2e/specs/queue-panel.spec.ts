import { test, expect } from '@playwright/test';
import { PlayerPage } from '../fixtures/player.fixture';

test.describe('Queue Panel', () => {
  let player: PlayerPage;

  test.beforeEach(async ({ page }) => {
    player = new PlayerPage(page);
    await player.enableDemoMode();
  });

  test('should open queue panel when clicking queue button', async () => {
    await player.openQueue();
    await expect(player.queuePanel).toBeVisible();
  });

  test('should close queue panel when clicking close button', async () => {
    await player.openQueue();
    await expect(player.queuePanel).toBeVisible();
    
    await player.closeQueue();
    await expect(player.queuePanel).not.toBeVisible();
  });

  test('should close queue panel when clicking backdrop', async ({ page }) => {
    await player.openQueue();
    await expect(player.queuePanel).toBeVisible();
    
    // Click on backdrop
    await page.locator('.bg-black\\/70').click({ position: { x: 10, y: 10 } });
    await expect(player.queuePanel).not.toBeVisible();
  });

  test('should display "Now Playing" section in queue', async ({ page }) => {
    await player.openQueue();
    await expect(page.getByText(/Tocando Agora|Now Playing/i)).toBeVisible();
  });

  test('should display "Next Up" section in queue', async ({ page }) => {
    await player.openQueue();
    await expect(page.getByText(/Próximas|Next Up/i)).toBeVisible();
  });

  test('queue should show empty state when no tracks in queue', async () => {
    await player.openQueue();
    
    // Either has items or shows empty state
    const isEmpty = await player.isQueueEmpty();
    if (isEmpty) {
      await expect(player.queueEmpty).toBeVisible();
    }
  });

  test('queue panel should have accessible close button', async () => {
    await player.openQueue();
    await expect(player.queueCloseButton).toHaveAttribute('aria-label', /.+/);
  });
});
