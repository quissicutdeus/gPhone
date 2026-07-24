import { test, expect } from '@playwright/test';

test.describe('Camera App E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('button', { hasText: 'Camera' }).first().click();
    await expect(page.locator('button[aria-label="Take photo"]')).toBeVisible();
  });

  test('renders Camera viewfinder and capture button', async ({ page }) => {
    const takePhotoBtn = page.locator('button[aria-label="Take photo"]');
    await expect(takePhotoBtn).toBeVisible();

    const goBackBtn = page.locator('button[aria-label="Go back"]');
    await expect(goBackBtn).toBeVisible();
  });
});
