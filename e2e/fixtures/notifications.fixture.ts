import { Locator, Page, expect } from '@playwright/test';

export class NotificationsFixture {
  readonly page: Page;
  readonly notificationsButton: Locator;
  readonly notificationsDropdown: Locator;
  readonly unreadBadge: Locator;
  readonly filtersButton: Locator;
  readonly filtersPopover: Locator;
  readonly markAllReadButton: Locator;
  readonly clearAllButton: Locator;
  readonly clearFiltersButton: Locator;
  readonly applyFiltersButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.notificationsButton = page.getByTestId('notifications-button');
    this.notificationsDropdown = page.getByTestId('notifications-dropdown');
    this.unreadBadge = page.getByTestId('notifications-unread-badge');
    this.filtersButton = page.getByTestId('notifications-filters-button');
    this.filtersPopover = page.getByTestId('notifications-filters-popover');
    this.markAllReadButton = page.getByTestId('mark-all-read-button');
    this.clearAllButton = page.getByTestId('clear-all-button');
    this.clearFiltersButton = page.getByTestId('clear-filters-button');
    this.applyFiltersButton = page.getByTestId('apply-filters-button');
  }

  async openNotifications() {
    await this.notificationsButton.click();
    await expect(this.notificationsDropdown).toBeVisible();
  }

  async closeNotifications() {
    // Click outside to close
    await this.page.keyboard.press('Escape');
    await expect(this.notificationsDropdown).not.toBeVisible();
  }

  async openFilters() {
    await this.filtersButton.click();
    await expect(this.filtersPopover).toBeVisible();
  }

  async filterBySeverity(severity: 'critical' | 'warning' | 'info') {
    await this.openFilters();
    await this.page.getByTestId(`filter-severity-${severity}`).click();
    await this.applyFiltersButton.click();
  }

  async filterByType(type: 'critical_issue' | 'scan_complete' | 'task_complete' | 'refactor_ready') {
    await this.openFilters();
    await this.page.getByTestId(`filter-type-${type}`).click();
    await this.applyFiltersButton.click();
  }

  async filterByReadStatus(status: 'all' | 'read' | 'unread') {
    await this.openFilters();
    await this.page.getByTestId(`filter-status-${status}`).click();
    await this.applyFiltersButton.click();
  }

  async clearFilters() {
    if (await this.clearFiltersButton.isVisible()) {
      await this.clearFiltersButton.click();
    }
  }

  async markAllAsRead() {
    if (await this.markAllReadButton.isVisible()) {
      await this.markAllReadButton.click();
    }
  }

  async clearAllNotifications() {
    if (await this.clearAllButton.isVisible()) {
      await this.clearAllButton.click();
    }
  }

  async getUnreadCount(): Promise<number> {
    const isVisible = await this.unreadBadge.isVisible();
    if (!isVisible) return 0;
    
    const text = await this.unreadBadge.textContent();
    if (text === '9+') return 10;
    return parseInt(text || '0', 10);
  }

  async getNotificationItems(): Promise<Locator[]> {
    const items = this.page.locator('[data-testid^="notification-item-"]');
    return items.all();
  }

  async getNotificationCount(): Promise<number> {
    const items = await this.getNotificationItems();
    return items.length;
  }

  async markNotificationAsRead(id: string) {
    await this.page.getByTestId(`mark-read-${id}`).click();
  }

  async deleteNotification(id: string) {
    await this.page.getByTestId(`delete-notification-${id}`).click();
  }

  async waitForNotification(title: string, timeout = 10000) {
    await this.page.waitForSelector(`text="${title}"`, { timeout });
  }
}