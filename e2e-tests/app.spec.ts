import { test, expect } from '@playwright/test';

const item = (id: number) => ({ id, title: `Mock story ${id}`, points: 10, user: 'alice', time: 1, time_ago: '1 hour ago', type: 'story', url: '', domain: '', comments: [], comments_count: 1, poll: [], poll_votes_count: 0, deleted: false, dead: false });

test.beforeEach(async ({ page }) => {
    await page.route(/node-hnapi\.herokuapp\.com\/(news|item)(?:\/|\?)/, (route) => {
        if (route.request().url().includes('/news?page=1')) {
            return route.fulfill({ json: Array.from({ length: 30 }, (_, i) => item(i + 1)) });
        }
        return route.fulfill({ json: { ...item(1), content: '<p>Details</p>', comments: [{ id: 2, user: 'bob', time_ago: 'now', content: 'A comment', comments: [], deleted: false }] } });
    });
});

test('loads the news feed and navigates to an item', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(page.getByRole('link', { name: 'new' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Mock story 1', exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'Mock story 1', exact: true }).click();
    await expect(page).toHaveURL(/\/item\/1$/);
    await expect(page.getByText('A comment')).toBeVisible();
});

test('opens settings and switches theme', async ({ page }) => {
    await page.goto('/news/1');
    await page.getByRole('button', { name: 'Settings' }).click();
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
    await page.getByLabel('Night').check();
    await expect(page.locator('body > #root > .night')).toBeVisible();
});
