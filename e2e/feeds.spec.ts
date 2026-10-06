import { expect, test } from '@playwright/test';
import { mockApi } from './mockApi';

test.beforeEach(async ({ page }) => {
    await mockApi(page);
});

test('redirects / to the first page of the news feed', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(page.getByRole('link', { name: 'news story 1', exact: true })).toBeVisible();
    await expect(page.locator('ol')).toHaveAttribute('start', '1');
});

test('paginates with More and Prev links', async ({ page }) => {
    await page.goto('/news/1');
    await expect(page.getByRole('link', { name: /prev/i })).toHaveCount(0);

    await page.getByRole('link', { name: /more/i }).click();
    await expect(page).toHaveURL(/\/news\/2$/);
    await expect(page.getByRole('link', { name: 'news story 31', exact: true })).toBeVisible();
    await expect(page.locator('ol')).toHaveAttribute('start', '31');
    await expect(page.getByRole('link', { name: /more/i })).toHaveCount(0);

    await page.getByRole('link', { name: /prev/i }).click();
    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(page.getByRole('link', { name: 'news story 1', exact: true })).toBeVisible();
});

for (const [label, feed] of [
    ['new', 'newest'],
    ['show', 'show'],
    ['ask', 'ask'],
    ['jobs', 'jobs'],
] as const) {
    test(`navigates to the ${feed} feed from the header`, async ({ page }) => {
        await page.goto('/news/1');
        await page.getByRole('navigation').getByRole('link', { name: label, exact: true }).click();
        await expect(page).toHaveURL(new RegExp(`/${feed}/1$`));
        await expect(page.getByRole('link', { name: `${feed} story 1`, exact: true })).toBeVisible();
    });
}

test('deep links to a feed page work on a full reload', async ({ page }) => {
    await page.goto('/show/2');
    await expect(page.getByRole('link', { name: 'show story 31', exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('link', { name: 'show story 31', exact: true })).toBeVisible();
});
