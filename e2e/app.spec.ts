import { expect, test } from '@playwright/test';
import { mockHackerNewsApi } from './fixtures';

test.beforeEach(async ({ page }) => {
    await mockHackerNewsApi(page);
});

test('redirects the root url to the first page of news', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL('/news/1');
    await expect(page.getByRole('link', { name: 'news p1 1', exact: true })).toBeVisible();
});

test('paginates through a feed', async ({ page }) => {
    await page.goto('/news/1');

    await expect(page.getByRole('list').first()).toHaveAttribute('start', '1');
    await page.getByRole('link', { name: 'More' }).click();

    await expect(page).toHaveURL('/news/2');
    await expect(page.getByRole('list').first()).toHaveAttribute('start', '31');

    await page.getByRole('link', { name: 'Prev' }).click();
    await expect(page).toHaveURL('/news/1');
});

test('navigates between feeds from the header', async ({ page }) => {
    await page.goto('/news/1');

    await page.getByRole('link', { name: 'ask', exact: true }).click();
    await expect(page).toHaveURL('/ask/1');
    await expect(page.getByRole('link', { name: 'ask p1 1', exact: true })).toBeVisible();

    await page.getByRole('link', { name: 'jobs', exact: true }).click();
    await expect(page).toHaveURL('/jobs/1');
    await expect(page.getByText(/jobs at startups that were funded by Y Combinator/)).toBeVisible();
});

test('opens an item and its comments, then goes back', async ({ page }) => {
    await page.goto('/news/1');

    await page.getByRole('link', { name: '1 comment' }).first().click();

    await expect(page).toHaveURL('/item/2');
    await expect(page.getByText('The story body')).toBeVisible();
    await expect(page.getByText('A top level comment')).toBeVisible();

    await page.getByText('[-]').click();
    await expect(page.getByText('A top level comment')).toBeHidden();
    await page.getByText('[+]').click();
    await expect(page.getByText('A top level comment')).toBeVisible();
});

test('opens a user profile from a story', async ({ page }) => {
    await page.goto('/news/1');

    await page.getByRole('link', { name: 'alice' }).first().click();

    await expect(page).toHaveURL('/user/alice');
    await expect(page.getByText('1234 ★')).toBeVisible();
    await expect(page.getByText('Created 5 years ago')).toBeVisible();
    await expect(page.getByText('Hello there')).toBeVisible();
});

test('persists theme, font size and link settings', async ({ page }) => {
    await page.goto('/news/1');

    await page.getByAltText('Settings').click();
    await page.getByRole('radio', { name: 'Night' }).check();
    await page.getByLabel('Font size:').fill('22');
    await page.getByLabel('Open links in a new tab').check();
    await page.getByRole('button', { name: 'Close settings' }).click();

    await expect(page.locator('div.night')).toBeVisible();
    await expect(page.getByRole('link', { name: 'news p1 1', exact: true })).toHaveCSS('font-size', '22px');
    await expect(page.getByRole('link', { name: 'news p1 1', exact: true })).toHaveAttribute('target', '_blank');

    await page.reload();

    await expect(page.locator('div.night')).toBeVisible();
    await expect(page.getByRole('link', { name: 'news p1 1', exact: true })).toHaveCSS('font-size', '22px');
});

test('shows an error message when the api is unavailable', async ({ page }) => {
    await page.route('https://node-hnapi.herokuapp.com/**', (route) => route.abort());

    await page.goto('/news/1');

    await expect(page.getByText('Could not load news stories.')).toBeVisible();
});
