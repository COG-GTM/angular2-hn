import { expect, test, type Locator, type Page } from '@playwright/test';

import { mockHackerNewsApi } from './fixtures/hn-api';

function visibleFeedLink(page: Page, text: RegExp): Locator {
    return page.locator('li.post a:visible').filter({ hasText: text }).first();
}

test.beforeEach(async ({ page }) => {
    await mockHackerNewsApi(page);
});

test('opens an item and its comment thread from the feed', async ({ page }) => {
    await page.goto('/news/1');

    // The feed renders a mobile and a laptop subtext block; only one of them is visible.
    await visibleFeedLink(page, /1 comment$/).click();

    await expect(page).toHaveURL(/\/item\/8001$/);
    await expect(page.getByText('The story body')).toBeVisible();
    await expect(page.getByText('A top level comment')).toBeVisible();
    await expect(page.getByText('A nested reply')).toBeVisible();
});

test('collapses and expands a comment thread', async ({ page }) => {
    await page.goto('/item/8001');

    await expect(page.getByText('A nested reply')).toBeVisible();

    await page.getByRole('button', { name: 'Collapse comment' }).first().click();

    await expect(page.getByText('A nested reply')).toBeHidden();

    await page.getByRole('button', { name: 'Expand comment' }).first().click();

    await expect(page.getByText('A nested reply')).toBeVisible();
});

test('opens a user profile from a story', async ({ page }) => {
    await page.goto('/news/1');

    await visibleFeedLink(page, /^author1$/).click();

    await expect(page).toHaveURL(/\/user\/author1$/);
    await expect(page.getByText('Created October 9, 2006')).toBeVisible();
    await expect(page.getByText('4321 ★')).toBeVisible();
    await expect(page.getByText('Writes things.')).toBeVisible();
});

test('shows an error message for a user that cannot be loaded', async ({ page }) => {
    await page.route('**/node-hnapi.herokuapp.com/user/**', (route) => route.abort());

    await page.goto('/user/nobody');

    await expect(page.getByText('Could not load user nobody.')).toBeVisible();
});
