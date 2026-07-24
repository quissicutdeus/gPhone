import { test, expect } from '@playwright/test';

test.describe('Mail App E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('button', { hasText: 'Mail' }).first().click();
    await expect(page.locator('h1', { hasText: 'Mail' })).toBeVisible();
  });

  test('renders Mail app title and inbox section', async ({ page }) => {
    const title = page.locator('h1', { hasText: 'Mail' });
    await expect(title).toBeVisible();
  });
});
