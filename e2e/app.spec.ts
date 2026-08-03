import { expect, test } from '@playwright/test';

import { mockHackerNewsApi } from './fixtures';

test.beforeEach(async ({ page }) => {
    await mockHackerNewsApi(page);
});

test('opens on the first page of news', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL('/news/1');
    await expect(page.getByRole('link', { name: 'Story with discussion' })).toBeVisible();
    await expect(page.locator('ol > li')).toHaveCount(30);
});

test('navigates between feeds from the header', async ({ page }) => {
    await page.goto('/news/1');

    await page.getByRole('link', { name: 'show', exact: true }).click();

    await expect(page).toHaveURL('/show/1');
    await expect(page.locator('ol > li').first()).toBeVisible();
});

test('pages through a feed', async ({ page }) => {
    await page.goto('/news/1');

    await expect(page.getByRole('link', { name: '‹ Prev' })).toHaveCount(0);
    await page.getByRole('link', { name: 'More ›' }).click();

    await expect(page).toHaveURL('/news/2');
    await expect(page.locator('ol')).toHaveAttribute('start', '31');
    await expect(page.getByRole('link', { name: '‹ Prev' })).toBeVisible();
});

test('opens a discussion and collapses a comment thread', async ({ page }) => {
    await page.goto('/news/1');

    await page.getByRole('link', { name: 'Story with discussion' }).first().click();

    await expect(page).toHaveURL('/item/100');
    await expect(page.getByText('The submitted text')).toBeVisible();
    await expect(page.getByText('A nested reply')).toBeVisible();

    await page.getByText('[-]').first().click();

    await expect(page.getByText('A nested reply')).toBeHidden();
    await expect(page.getByText('[+]')).toBeVisible();
});

test('opens a user profile from a comment', async ({ page }) => {
    await page.goto('/item/100');

    await page.getByRole('link', { name: 'pg' }).first().click();

    await expect(page).toHaveURL('/user/pg');
    await expect(page.getByText('155000 ★')).toBeVisible();
    await expect(page.getByText('Created October 2006')).toBeVisible();
});

test('shows an error when the feed cannot be loaded', async ({ page }) => {
    await page.route('https://node-hnapi.herokuapp.com/**', (route) => route.abort());

    await page.goto('/ask/1');

    await expect(page.getByText('Could not load ask stories.')).toBeVisible();
});

test('persists settings across a reload', async ({ page }) => {
    await page.goto('/news/1');

    await page.getByAltText('Settings').click();
    await page.getByRole('radio', { name: 'Night' }).check();
    await page.getByLabel('Font size:').fill('22');
    await page.getByText('×').click();

    await expect(page.locator('div.night')).toBeVisible();

    await page.reload();

    await expect(page.locator('div.night')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Story with discussion' })).toHaveCSS('font-size', '22px');
});
