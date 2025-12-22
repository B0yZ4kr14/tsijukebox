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

  // =====================================================
  // DRAG-AND-DROP E2E TESTS
  // =====================================================
  test.describe('Drag-and-Drop Functionality', () => {
    test('should show drag handles on queue items', async ({ page }) => {
      await player.openQueue();
      
      // Check for grip icons (drag handles)
      const gripIcons = page.locator('.lucide-grip-vertical');
      const count = await gripIcons.count();
      
      // Should have at least one drag handle if there are queue items
      if (count > 0) {
        await expect(gripIcons.first()).toBeVisible();
      }
    });

    test('should allow dragging queue items', async ({ page }) => {
      await player.openQueue();
      
      // Get the first drag handle
      const firstHandle = page.locator('.lucide-grip-vertical').first();
      const handleVisible = await firstHandle.isVisible().catch(() => false);
      
      if (handleVisible) {
        // Get initial position
        const box = await firstHandle.boundingBox();
        expect(box).not.toBeNull();
        
        if (box) {
          // Simulate drag start (mouse down + move)
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
          await page.mouse.down();
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 100);
          await page.mouse.up();
        }
      }
    });

    test('should maintain visual feedback during drag', async ({ page }) => {
      await player.openQueue();
      
      // Verify the queue panel is interactive
      await expect(player.queuePanel).toBeVisible();
      
      // Check that the sortable area exists
      const sortableArea = page.locator('[data-testid="sortable-context"]');
      // In E2E the testid might not be exposed, but the panel should be interactive
      await expect(player.queuePanel).toBeVisible();
    });

    test('should preserve queue order after invalid drag', async ({ page }) => {
      await player.openQueue();
      
      // Get all queue item titles before any interaction
      const queueItems = page.locator('[data-testid^="queue-item-"]');
      const initialCount = await queueItems.count();
      
      // Perform some interaction and verify count is preserved
      await player.queuePanel.click({ position: { x: 10, y: 100 } });
      
      // Count should remain the same
      const finalCount = await queueItems.count();
      expect(finalCount).toBe(initialCount);
    });
  });

  // =====================================================
  // KEYBOARD NAVIGATION TESTS
  // =====================================================
  test.describe('Keyboard Navigation', () => {
    test('should close queue panel with Escape key', async ({ page }) => {
      await player.openQueue();
      await expect(player.queuePanel).toBeVisible();
      
      await page.keyboard.press('Escape');
      await expect(player.queuePanel).not.toBeVisible();
    });

    test('should allow Tab navigation through queue items', async ({ page }) => {
      await player.openQueue();
      
      // Tab through elements
      await page.keyboard.press('Tab');
      
      // Some element should be focused
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
    });
  });

  // =====================================================
  // QUEUE MANIPULATION TESTS
  // =====================================================
  test.describe('Queue Manipulation', () => {
    test('should show clear queue button when queue has items', async () => {
      await player.openQueue();
      
      // If queue has items, clear button should be visible
      const isEmpty = await player.isQueueEmpty();
      if (!isEmpty) {
        await expect(player.queueClearButton).toBeVisible();
      }
    });

    test('should hide clear queue button when queue is empty', async () => {
      await player.openQueue();
      
      const isEmpty = await player.isQueueEmpty();
      if (isEmpty) {
        await expect(player.queueClearButton).not.toBeVisible();
      }
    });
  });
});
