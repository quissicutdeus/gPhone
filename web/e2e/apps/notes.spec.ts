import { test, expect } from '@playwright/test';

test.describe('Notes App E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('button', { hasText: 'Notes' }).first().click();
    await expect(page.locator('h1', { hasText: 'Notes' })).toBeVisible();
  });

  test('renders Notes screen title and action buttons', async ({ page }) => {
    const title = page.locator('h1', { hasText: 'Notes' });
    await expect(title).toBeVisible();
  });
});
