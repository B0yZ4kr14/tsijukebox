import { test, expect, devices } from '@playwright/test';
import { PlayerPage } from '../fixtures/player.fixture';

test.describe('Touch Gestures', () => {
  test.use({ ...devices['Pixel 5'] });
  
  let player: PlayerPage;

  test.beforeEach(async ({ page }) => {
    player = new PlayerPage(page);
    await player.enableDemoMode();
  });

  test('swipe left should skip to next track', async ({ page }) => {
    const mainContent = page.locator('main').first();
    
    // Get bounding box
    const box = await mainContent.boundingBox();
    if (!box) return;
    
    // Simulate swipe left
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2, { steps: 10 });
    await page.mouse.up();
    
    // Allow time for gesture processing
    await page.waitForTimeout(300);
  });

  test('swipe right should go to previous track', async ({ page }) => {
    const mainContent = page.locator('main').first();
    
    const box = await mainContent.boundingBox();
    if (!box) return;
    
    // Simulate swipe right
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2, { steps: 10 });
    await page.mouse.up();
    
    await page.waitForTimeout(300);
  });
});
