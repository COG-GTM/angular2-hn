import { expect, test } from '@playwright/test';

import { mockHackerNewsApi } from './fixtures/hn-api';

test.beforeEach(async ({ page }) => {
    await mockHackerNewsApi(page);
});

test('redirects the root url to the first news page and lists stories', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(page.getByRole('link', { name: 'Page 1 story 1', exact: true })).toBeVisible();
    await expect(page.locator('ol > li.post')).toHaveCount(30);
    await expect(page.locator('ol')).toHaveAttribute('start', '1');
});

test('pages forward and back through the news feed', async ({ page }) => {
    await page.goto('/news/1');

    await page.getByRole('link', { name: /More/ }).click();

    await expect(page).toHaveURL(/\/news\/2$/);
    await expect(page.locator('ol')).toHaveAttribute('start', '31');
    await expect(page.getByRole('link', { name: 'Page 2 story 1', exact: true })).toBeVisible();

    await page.getByRole('link', { name: /Prev/ }).click();

    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(page.locator('ol')).toHaveAttribute('start', '1');
});

test('navigates between feeds from the header', async ({ page }) => {
    await page.goto('/news/1');

    for (const [label, path] of [
        ['new', 'newest'],
        ['show', 'show'],
        ['ask', 'ask'],
        ['jobs', 'jobs'],
    ] as const) {
        await page.getByRole('link', { name: label, exact: true }).click();
        await expect(page).toHaveURL(new RegExp(`/${path}/1$`));
        await expect(page.locator('ol > li.post').first()).toBeVisible();
    }

    await expect(page.getByText(/jobs at startups that were funded by Y Combinator/)).toBeVisible();
});

test('shows an error message when the feed cannot be loaded', async ({ page }) => {
    await page.route('**/node-hnapi.herokuapp.com/news**', (route) => route.abort());

    await page.goto('/news/1');

    await expect(page.getByText('Could not load news stories.')).toBeVisible();
});
