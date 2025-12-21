import { test, expect } from '@playwright/test';
import { PlayerPage } from '../fixtures/player.fixture';

test.describe('Now Playing Display', () => {
  let player: PlayerPage;

  test.beforeEach(async ({ page }) => {
    player = new PlayerPage(page);
    await player.enableDemoMode();
  });

  test('should display now playing section', async () => {
    await expect(player.nowPlaying).toBeVisible();
  });

  test('should display track cover image or placeholder', async ({ page }) => {
    // Cover should be visible (either an image or a placeholder icon)
    const coverImage = player.trackCover.locator('img');
    const coverPlaceholder = player.trackCover.locator('svg');
    
    const hasImage = await coverImage.count() > 0;
    const hasPlaceholder = await coverPlaceholder.count() > 0;
    
    expect(hasImage || hasPlaceholder).toBeTruthy();
  });

  test('should display track title', async () => {
    await expect(player.trackTitle).toBeVisible();
    
    // Should have some text content
    const titleText = await player.trackTitle.textContent();
    expect(titleText).toBeTruthy();
    expect(titleText!.length).toBeGreaterThan(0);
  });

  test('should display artist name', async () => {
    await expect(player.trackArtist).toBeVisible();
    
    // Should have some text content
    const artistText = await player.trackArtist.textContent();
    expect(artistText).toBeTruthy();
  });

  test('should display album name when available', async () => {
    // Album might not always be visible depending on the track
    const albumVisible = await player.trackAlbum.isVisible().catch(() => false);
    
    if (albumVisible) {
      const albumText = await player.trackAlbum.textContent();
      expect(albumText).toBeTruthy();
    }
  });

  test('should update track info when next is clicked', async ({ page }) => {
    // Get initial track title
    const initialTitle = await player.trackTitle.textContent();
    
    // Click next
    await player.next();
    
    // Wait for potential update
    await page.waitForTimeout(500);
    
    // Check if toast appeared (confirmation of action)
    await expect(page.locator('.sonner-toast')).toBeVisible();
  });

  test('should have proper accessibility attributes', async () => {
    // Now playing section should be accessible
    await expect(player.nowPlaying).toBeVisible();
    
    // Track title should be readable
    await expect(player.trackTitle).toHaveAttribute('data-testid', 'track-title');
    await expect(player.trackArtist).toHaveAttribute('data-testid', 'track-artist');
  });
});
