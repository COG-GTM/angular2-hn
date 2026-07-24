import { expect, test } from '@playwright/test';

test('redirects to /news/1 and renders the news feed', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(page.locator('ol li.post').first()).toBeVisible();
});

test('navigates between feeds via the header', async ({ page }) => {
    await page.goto('/news/1');
    await page.getByRole('link', { name: 'ask' }).click();
    await expect(page).toHaveURL(/\/ask\/1$/);
    await expect(page.locator('ol li.post').first()).toBeVisible();
});

test('opens an item details page with comments', async ({ page }) => {
    await page.goto('/news/1');
    await page.locator('.subtext-laptop a', { hasText: /comments|discuss/ }).first().click();
    await expect(page).toHaveURL(/\/item\/\d+$/);
    await expect(page.locator('.comment-list')).toBeVisible();
});

test('opens a user profile page', async ({ page }) => {
    await page.goto('/news/1');
    await page.locator('.subtext-laptop a').first().click();
    await expect(page).toHaveURL(/\/user\/.+$/);
    // node-hnapi's /user endpoint is currently returning 404 upstream, so
    // accept either a loaded profile or the error state.
    await expect(page.locator('.main-details, .error-section').first()).toBeVisible({ timeout: 15_000 });
});

test('settings panel toggles theme', async ({ page }) => {
    await page.goto('/news/1');
    await page.locator('img.settings').click();
    await expect(page.locator('.popup')).toBeVisible();
    await page.getByLabel('Night').check();
    await expect(page.locator('#root > div').first()).toHaveClass(/night/);
});
