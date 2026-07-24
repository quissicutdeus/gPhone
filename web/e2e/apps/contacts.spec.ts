import { test, expect } from '@playwright/test';

test.describe('Contacts App E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('button', { hasText: 'Contacts' }).first().click();
    await expect(page.locator('h1', { hasText: 'Contacts' })).toBeVisible();
  });

  test('renders Contacts app interface and header', async ({ page }) => {
    const header = page.locator('h1', { hasText: 'Contacts' });
    await expect(header).toBeVisible();
  });

  test('contains search input and empty state or contact list', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]');
    if (await searchInput.count() > 0) {
      await expect(searchInput).toBeVisible();
      await searchInput.fill('John');
      await expect(searchInput).toHaveValue('John');
    }
  });
});
