import { expect, test } from '@playwright/test';

test('redirects root to /news/1 and renders the feed', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/news\/1$/);
  await expect(page.locator('#header')).toBeVisible();
  await expect(page.locator('.item-list li, ol li').first()).toBeVisible({ timeout: 20000 });
});

test('navigates between feeds via the header', async ({ page }) => {
  await page.goto('/news/1');
  await page.getByRole('link', { name: 'ask' }).click();
  await expect(page).toHaveURL(/\/ask\/1$/);
});

test('opens an item detail page with comments', async ({ page }) => {
  await page.goto('/news/1');
  const commentLink = page.locator('a[href^="/item/"]:visible').first();
  await commentLink.click();
  await expect(page).toHaveURL(/\/item\/\d+/);
});

test('opens the settings panel and switches theme', async ({ page }) => {
  await page.goto('/news/1');
  await page.locator('img.settings').click();
  await expect(page.locator('#popup1 .popup')).toBeVisible();
  await page.getByLabel('Night').check();
  await expect(page.locator('#root > div.night')).toBeVisible();
});
