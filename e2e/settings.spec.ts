import { expect, test } from '@playwright/test';

const stories = [
    {
        id: 1,
        title: 'A deterministic story',
        points: 42,
        user: 'tester',
        time_ago: '1 hour ago',
        comments_count: 3,
        type: 'link',
        url: 'https://example.com/story',
        domain: 'example.com',
    },
];

test.beforeEach(async ({ page }) => {
    await page.route('**/node-hnapi.herokuapp.com/**', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(stories) })
    );
});

test('opens the settings panel and applies the Night theme across reloads', async ({ page }) => {
    await page.goto('/news/1');

    const root = page.locator('#root > div').first();

    await page.locator('#header .info img').click();
    await expect(page.locator('#popup1 .popup h1')).toHaveText('Settings');

    await page.getByLabel('Night').check();
    await expect(root).toHaveClass('night');

    await page.locator('#popup1 .close').click();
    await expect(page.locator('#popup1')).toHaveCount(0);

    await page.reload();
    await expect(page.locator('#root > div').first()).toHaveClass('night');
});

test('header nav links navigate between feeds', async ({ page }) => {
    await page.goto('/news/1');

    await page.locator('#header').getByRole('link', { name: 'show' }).click();
    await expect(page).toHaveURL(/\/show\/1$/);
    await expect(page.locator('#header').getByRole('link', { name: 'show' })).toHaveClass(/active/);
});
