import { expect, test } from '@playwright/test';

test('redirects / to /news/1 and renders 30 stories', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(page.locator('li.post')).toHaveCount(30, { timeout: 15000 });
});

test('header navigation switches feeds', async ({ page }) => {
    await page.goto('/news/1');
    await page.getByRole('link', { name: 'ask' }).click();
    await expect(page).toHaveURL(/\/ask\/1$/);
    await expect(page.locator('li.post').first()).toBeVisible({ timeout: 15000 });
});

test('More link paginates to page 2', async ({ page }) => {
    await page.goto('/news/1');
    await page.locator('a.more').click();
    await expect(page).toHaveURL(/\/news\/2$/);
    await expect(page.locator('ol[start="31"]')).toBeVisible({ timeout: 15000 });
});

test('item details page shows comments', async ({ page }) => {
    await page.goto('/news/1');
    await page.locator('li.post .subtext-laptop a[href^="/item/"]').first().click();
    await expect(page).toHaveURL(/\/item\/\d+$/);
    await expect(page.locator('.comment-list')).toBeVisible({ timeout: 15000 });
});

test('user profile page loads or fails gracefully', async ({ page }) => {
    // Note: the upstream node-hnapi /user/:id endpoint currently returns 404
    // for every user, so the graceful error state is the expected outcome
    // until the API is fixed. Both outcomes are accepted here.
    await page.goto('/news/1');
    const userLink = page.locator('li.post .subtext-laptop a[href^="/user/"]').first();
    await userLink.click();
    await expect(page).toHaveURL(/\/user\/.+/);
    await expect(
        page.locator('.main-details .name').or(page.locator('.error-section p.strong'))
    ).toBeVisible({ timeout: 15000 });
});

test('settings panel toggles theme class', async ({ page }) => {
    await page.goto('/news/1');
    await page.locator('img.settings').click();
    await page.getByLabel('Night').check();
    await expect(page.locator('div.night .wrapper')).toBeVisible();
    await expect
        .poll(async () => page.evaluate(() => localStorage.getItem('theme')))
        .toBe('night');
});
