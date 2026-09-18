import { expect, test } from '@playwright/test';
import { mockApi } from './support/mockApi';

test.describe('app shell', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
  });

  test('redirects the root url to the news feed', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(page.locator('.wrapper')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Angular 2 HN' })).toBeVisible();
  });

  test('resolves a feed route directly', async ({ page }) => {
    await page.goto('/show/2');

    await expect(page.locator('.feed')).toBeVisible();
  });
});
