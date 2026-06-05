import { test, expect } from '@playwright/test';

test.describe('angular2-hn', () => {
  test('redirects to the news feed and renders the header navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/news\/1$/);

    const header = page.locator('app-header');
    await expect(header).toBeVisible();
    await expect(header.getByRole('link', { name: 'new' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'show' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'ask' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'jobs' })).toBeVisible();
  });

  test('navigates to the jobs feed', async ({ page }) => {
    await page.goto('/');
    await page.locator('app-header').getByRole('link', { name: 'jobs' }).click();
    await expect(page).toHaveURL(/\/jobs\/1$/);
  });
});
