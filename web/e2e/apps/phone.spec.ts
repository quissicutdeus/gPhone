import { test, expect } from '@playwright/test';

test.describe('Phone Dialer App E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('button', { hasText: 'Phone' }).first().click();
    await expect(page.locator('h1', { hasText: 'Phone' })).toBeVisible();
  });

  test('dials numbers using numeric keypad and clears with backspace', async ({ page }) => {
    const btn5 = page.locator('button', { hasText: '5' }).first();

    // Click 5 5 5
    await btn5.click();
    await btn5.click();
    await btn5.click();

    // Verify number display contains 555
    const numberDisplay = page.locator('.text-4xl');
    await expect(numberDisplay).toHaveText('555');

    // Click Backspace button
    const backspaceBtn = page.locator('button[aria-label="Backspace"]');
    await expect(backspaceBtn).toBeVisible();
    await backspaceBtn.click();

    await expect(numberDisplay).toHaveText('55');
  });

  test('initiates call and transitions to calling view controls', async ({ page }) => {
    const btn9 = page.locator('button', { hasText: '9' }).first();
    await btn9.click();

    const callBtn = page.locator('button[aria-label="Call"]');
    await expect(callBtn).toBeVisible();
    await callBtn.click();

    // In-call view elements
    const endCallBtn = page.locator('button[aria-label="End Call"]');
    await expect(endCallBtn).toBeVisible();

    const speakerBtn = page.locator('button[aria-label="Speaker"]');
    await expect(speakerBtn).toBeVisible();
    await speakerBtn.click();

    // End call and return to idle keypad state
    await endCallBtn.click();
    await expect(callBtn).toBeVisible();
  });
});
