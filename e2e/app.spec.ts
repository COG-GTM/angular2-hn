import { test, expect } from '@playwright/test';

test.describe('angular-hnpwa App', () => {
  test('should load the app shell with the header navigation', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('app-root')).toBeVisible();
    await expect(page.locator('app-header')).toBeVisible();

    await expect(page.getByRole('link', { name: 'ask' })).toBeVisible();
  });
});
