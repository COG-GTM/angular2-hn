import { expect, test } from '@playwright/test';

test.describe('Angular 2 HN (React)', () => {
  test('redirects the root path to the news feed', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(page.locator('#header')).toBeVisible();
  });

  test('navigates between feeds via the header', async ({ page }) => {
    await page.goto('/news/1');

    await page.getByRole('link', { name: 'show', exact: true }).click();
    await expect(page).toHaveURL(/\/show\/1$/);

    await page.getByRole('link', { name: 'ask', exact: true }).click();
    await expect(page).toHaveURL(/\/ask\/1$/);

    await page.getByRole('link', { name: 'jobs', exact: true }).click();
    await expect(page).toHaveURL(/\/jobs\/1$/);
  });

  test('loads a feed and paginates to the next page', async ({ page }) => {
    await page.goto('/news/1');
    await expect(page.locator('ol li.post').first()).toBeVisible({ timeout: 30000 });

    await page.getByRole('link', { name: /More/ }).click();
    await expect(page).toHaveURL(/\/news\/2$/);
  });

  test('opens an item detail page with comments', async ({ page }) => {
    await page.goto('/news/1');
    await expect(page.locator('ol li.post').first()).toBeVisible({ timeout: 30000 });

    await page.locator('.subtext-laptop .item-details a').first().click();
    await expect(page).toHaveURL(/\/item\/\d+$/);
  });

  test('loads a user profile page', async ({ page }) => {
    await page.goto('/news/1');
    await expect(page.locator('ol li.post').first()).toBeVisible({ timeout: 30000 });

    await page.locator('.subtext-laptop a').first().click();
    await expect(page).toHaveURL(/\/user\/.+$/);
    await expect(page.locator('.profile')).toBeVisible({ timeout: 30000 });
  });

  test('switches theme and persists the choice across reloads', async ({ page }) => {
    await page.goto('/news/1');

    // Open settings via the cog icon and pick the Night theme.
    await page.locator('img.settings').click();
    await page.getByRole('radio', { name: 'Night' }).check();

    await expect(page.locator('body >> .night')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('night');

    await page.reload();
    await expect(page.locator('body >> .night')).toBeVisible();
  });
});
