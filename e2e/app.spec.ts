import { test, expect } from '@playwright/test';

const FEEDS = ['news', 'newest', 'show', 'ask', 'jobs'];

test('/ redirects to /news/1', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/news\/1$/);
});

test('loads stories on each of the five feeds', async ({ page }) => {
    for (const feed of FEEDS) {
        await page.goto(`/${feed}/1`);
        await expect(page.locator('li.post').first()).toBeVisible({ timeout: 30000 });
    }
});

test('clicking a story opens item details with comments', async ({ page }) => {
    await page.goto('/news/1');
    await expect(page.locator('li.post').first()).toBeVisible({ timeout: 30000 });
    await page.locator('a[href^="/item/"]:visible').first().click();
    await expect(page).toHaveURL(/\/item\/\d+/);
    await expect(page.locator('.item')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('.comment-list .comment-block').first()).toBeVisible({ timeout: 30000 });
});

test('clicking a user opens the user profile', async ({ page }) => {
    // The public node-hnapi deployment no longer serves the /user/:id endpoint
    // (it responds with a 404), so mock it here to verify the client rendering.
    await page.route('**/user/*', (route) =>
        route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify({ id: 'someuser', karma: 4321, created: 'January 1, 2020', about: 'Hi there' }),
        })
    );

    await page.goto('/news/1');
    await expect(page.locator('li.post').first()).toBeVisible({ timeout: 30000 });
    await page.locator('a[href^="/user/"]:visible').first().click();
    await expect(page).toHaveURL(/\/user\/.+/);
    await expect(page.locator('.profile .name')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('.profile .name')).toHaveText('someuser');
});

test('pagination navigates to the next page', async ({ page }) => {
    await page.goto('/news/1');
    await expect(page.locator('li.post').first()).toBeVisible({ timeout: 30000 });
    await page.getByText('More ›').click();
    await expect(page).toHaveURL(/\/news\/2$/);
    await expect(page.locator('ol')).toHaveAttribute('start', '31');
});

test('theme switch persists across reloads', async ({ page }) => {
    await page.goto('/news/1');
    await page.getByAltText('Settings').click();
    await page.getByRole('radio', { name: 'Night' }).click();
    await expect(page.locator('.night')).toHaveCount(1);

    await page.reload();
    await expect(page.locator('.night')).toHaveCount(1);

    const savedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(savedTheme).toBe('night');
});

test('registers a service worker in the production build', async ({ page }) => {
    await page.goto('/news/1');
    const hasRegistration = await page.waitForFunction(
        async () => {
            if (!('serviceWorker' in navigator)) {
                return false;
            }
            const registration = await navigator.serviceWorker.getRegistration();
            return !!registration;
        },
        undefined,
        { timeout: 30000 }
    );
    expect(await hasRegistration.jsonValue()).toBe(true);
});
