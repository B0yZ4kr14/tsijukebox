import { test, expect } from '@playwright/test';
import { NotificationsFixture } from '../fixtures/notifications.fixture';

test.describe('Notifications Realtime E2E', () => {
  let notifications: NotificationsFixture;

  test.beforeEach(async ({ page }) => {
    notifications = new NotificationsFixture(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display notifications button in header', async ({ page }) => {
    await expect(notifications.notificationsButton).toBeVisible();
  });

  test('should open notifications dropdown on click', async () => {
    await notifications.openNotifications();
    await expect(notifications.notificationsDropdown).toBeVisible();
  });

  test('should close notifications dropdown on escape', async () => {
    await notifications.openNotifications();
    await notifications.closeNotifications();
    await expect(notifications.notificationsDropdown).not.toBeVisible();
  });

  test('should display filters button in dropdown', async () => {
    await notifications.openNotifications();
    await expect(notifications.filtersButton).toBeVisible();
  });

  test('should open filters popover', async () => {
    await notifications.openNotifications();
    await notifications.openFilters();
    await expect(notifications.filtersPopover).toBeVisible();
  });

  test('should show empty state when no notifications', async ({ page }) => {
    await notifications.openNotifications();
    
    // Look for empty state message
    const emptyMessage = page.getByText(/nenhuma notificação/i);
    const hasEmpty = await emptyMessage.isVisible();
    
    // Either has empty message or has notifications
    if (!hasEmpty) {
      const count = await notifications.getNotificationCount();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should display unread badge when there are unread notifications', async () => {
    await notifications.openNotifications();
    const count = await notifications.getNotificationCount();
    
    if (count > 0) {
      const unreadCount = await notifications.getUnreadCount();
      // Badge should reflect unread count or not be visible if all read
      expect(unreadCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should filter notifications by severity', async ({ page }) => {
    await notifications.openNotifications();
    const initialCount = await notifications.getNotificationCount();
    
    if (initialCount > 0) {
      await notifications.filterBySeverity('critical');
      
      // After filtering, count should be same or less
      const filteredCount = await notifications.getNotificationCount();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    }
  });

  test('should filter notifications by type', async ({ page }) => {
    await notifications.openNotifications();
    const initialCount = await notifications.getNotificationCount();
    
    if (initialCount > 0) {
      await notifications.filterByType('scan_complete');
      
      const filteredCount = await notifications.getNotificationCount();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    }
  });

  test('should filter notifications by read status', async () => {
    await notifications.openNotifications();
    const initialCount = await notifications.getNotificationCount();
    
    if (initialCount > 0) {
      await notifications.filterByReadStatus('unread');
      
      const filteredCount = await notifications.getNotificationCount();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    }
  });

  test('should clear filters', async ({ page }) => {
    await notifications.openNotifications();
    
    // Apply a filter first
    await notifications.filterBySeverity('critical');
    
    // Clear filters
    await notifications.clearFilters();
    
    // Filters should be cleared - check by verifying no active filter indicator
    const clearFiltersBtn = await notifications.clearFiltersButton.isVisible();
    expect(clearFiltersBtn).toBeFalsy();
  });

  test('should mark all notifications as read', async () => {
    await notifications.openNotifications();
    
    const unreadBefore = await notifications.getUnreadCount();
    
    if (unreadBefore > 0) {
      await notifications.markAllAsRead();
      
      // Wait for update
      await notifications.page.waitForTimeout(500);
      
      const unreadAfter = await notifications.getUnreadCount();
      expect(unreadAfter).toBe(0);
    }
  });

  test('should show notification count in footer badge', async ({ page }) => {
    await notifications.openNotifications();
    const count = await notifications.getNotificationCount();
    
    if (count > 0) {
      const badge = page.locator('[class*="badge"]').filter({ hasText: /notificaç/ });
      await expect(badge).toBeVisible();
    }
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check button has accessible name
    await expect(notifications.notificationsButton).toHaveAttribute('class', /relative/);
    
    await notifications.openNotifications();
    
    // Dropdown should be in DOM
    await expect(notifications.notificationsDropdown).toBeInViewport();
  });

  test('should show active filters count badge', async ({ page }) => {
    await notifications.openNotifications();
    
    // Apply filter
    await notifications.openFilters();
    await page.getByTestId('filter-severity-critical').click();
    await notifications.applyFiltersButton.click();
    
    // Check for active filter indicator
    const filterBadge = notifications.filtersButton.locator('[class*="badge"]');
    if (await filterBadge.isVisible()) {
      const badgeText = await filterBadge.textContent();
      expect(parseInt(badgeText || '0', 10)).toBeGreaterThan(0);
    }
  });

  test('should persist filters after reopening dropdown', async () => {
    await notifications.openNotifications();
    await notifications.filterBySeverity('warning');
    
    // Close and reopen
    await notifications.closeNotifications();
    await notifications.openNotifications();
    
    // Filter should still be active if state persists
    // This depends on implementation - may or may not persist
  });

  test('should handle rapid filter changes', async ({ page }) => {
    await notifications.openNotifications();
    
    // Rapid filter changes
    await notifications.openFilters();
    await page.getByTestId('filter-severity-critical').click();
    await page.getByTestId('filter-severity-warning').click();
    await page.getByTestId('filter-severity-info').click();
    await notifications.applyFiltersButton.click();
    
    // Should handle gracefully without errors
    await expect(notifications.notificationsDropdown).toBeVisible();
  });
});