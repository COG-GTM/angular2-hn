import { expect, test } from '@playwright/test';

// Smoke tests against the real public APIs (no fixtures).
test.describe('live API', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(/google-analytics\.com/, route => route.fulfill({ status: 204, body: '' }));
  });

  test('news feed loads', async ({ page }) => {
    await page.goto('/news/1');
    await expect(page.locator('li.post')).toHaveCount(30, { timeout: 20_000 });
  });

  test('item details load', async ({ page }) => {
    await page.goto('/item/8863');
    await expect(page.locator('.laptop a.title')).toContainText('My YC app: Dropbox', { timeout: 20_000 });
    await expect(page.locator('app-comment').first()).toBeVisible();
  });

  test('user profile loads', async ({ page }) => {
    await page.goto('/user/pg');
    await expect(page.locator('.main-details .name')).toHaveText('pg', { timeout: 20_000 });
  });
});
