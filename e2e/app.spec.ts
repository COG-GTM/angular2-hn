import { expect, test } from '@playwright/test';

// Smoke tests against the live Hacker News APIs.
test('redirects to the news feed and renders stories', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(page.locator('ol > li.post').first()).toBeVisible();
});

for (const feed of ['newest', 'show', 'ask', 'jobs']) {
    test(`navigates to the ${feed} feed`, async ({ page }) => {
        await page.goto('/news/1');
        await page.locator('.header-nav').getByRole('link', { name: feed === 'newest' ? 'new' : feed }).click();
        await expect(page).toHaveURL(new RegExp(`/${feed}/1$`));
        await expect(page.locator('ol > li.post').first()).toBeVisible();
    });
}

test('opens an item and a user profile', async ({ page }) => {
    await page.goto('/item/8863');
    await expect(page.locator('.laptop .title')).toHaveText(/Dropbox/);
    await page.locator('.laptop .subtext').getByRole('link', { name: 'dhouston' }).click();
    await expect(page).toHaveURL(/\/user\/dhouston$/);
    await expect(page.locator('.main-details .name')).toHaveText('dhouston');
});
