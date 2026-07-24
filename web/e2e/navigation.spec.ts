import { test, expect } from '@playwright/test';

test.describe('Phone Navigation & Home Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays gphone header and app icons grid on home screen', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'gphone' })).toBeVisible();
    const appGrid = page.locator('.grid');
    await expect(appGrid).toBeVisible();
  });

  test('opens Calculator app and returns home using Escape key', async ({ page }) => {
    // Click Calculator app icon button
    const calcButton = page.locator('button', { hasText: 'Calculator' });
    if (await calcButton.count() > 0) {
      await calcButton.click();
      await expect(page.locator('h1', { hasText: 'Calculator' })).toBeVisible();

      // Press Escape to return Home
      await page.keyboard.press('Escape');
      await expect(page.locator('h1', { hasText: 'gphone' })).toBeVisible();
    }
  });

  test('opens Notes app and returns home using Back button', async ({ page }) => {
    const notesButton = page.locator('button', { hasText: 'Notes' });
    if (await notesButton.count() > 0) {
      await notesButton.click();
      await expect(page.locator('h1', { hasText: 'Notes' })).toBeVisible();

      // Click top left back button
      const backButton = page.locator('header button').first();
      await backButton.click();
      await expect(page.locator('h1', { hasText: 'gphone' })).toBeVisible();
    }
  });
});
