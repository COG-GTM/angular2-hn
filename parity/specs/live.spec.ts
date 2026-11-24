import { test, expect } from '@playwright/test';

// Unmocked smoke check against the real public APIs (node-hnapi + api.hnpwa.com).
test.beforeEach(async ({ page }) => page.route(/google-analytics\.com/, (r) => r.abort()));

test('live: news feed loads from the public API', async ({ page }) => {
  await page.goto('/news/1');
  await expect(page.locator('li.post').first()).toBeVisible({ timeout: 30_000 });
  expect(await page.locator('li.post').count()).toBeGreaterThan(10);
});

test('live: user profile loads from api.hnpwa.com', async ({ page }) => {
  await page.goto('/user/pg');
  await expect(page.locator('.main-details .name')).toHaveText('pg', { timeout: 30_000 });
});
