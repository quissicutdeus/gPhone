import { test, expect } from '@playwright/test';

test.describe('Bank App E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('button', { hasText: 'Bank' }).first().click();
    await expect(page.locator('h1', { hasText: 'Bank' })).toBeVisible();
  });

  test('renders Bank screen title and recent transactions section', async ({ page }) => {
    const recentTxHeading = page.locator('h3', { hasText: 'Recent Transactions' });
    await expect(recentTxHeading).toBeVisible();
  });
});
