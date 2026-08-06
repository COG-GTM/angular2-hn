import { expect, test } from '@playwright/test';

import { mockHackerNewsApi } from './fixtures';

test.beforeEach(async ({ page }) => {
    await mockHackerNewsApi(page);
});

test('redirects the root url to the news feed and lists stories', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL('/news/1');
    await expect(page.locator('li.post')).toHaveCount(30);
    await expect(page.locator('li.post').first().locator('a.title')).toHaveText('news story 1 (page 1)');
});

test('navigates between the feeds from the header', async ({ page }) => {
    await page.goto('/news/1');

    for (const [link, feedType] of [
        ['new', 'newest'],
        ['show', 'show'],
        ['ask', 'ask'],
        ['jobs', 'jobs'],
    ]) {
        await page.locator('.header-nav').getByRole('link', { name: link, exact: true }).click();
        await expect(page).toHaveURL(`/${feedType}/1`);
        await expect(page.locator('li.post').first().locator('a.title')).toHaveText(`${feedType} story 1 (page 1)`);
    }

    await expect(page.locator('p.job-header')).toBeVisible();
});

test('paginates the feed', async ({ page }) => {
    await page.goto('/news/1');

    await expect(page.locator('a.prev')).toHaveCount(0);
    await page.locator('a.more').click();

    await expect(page).toHaveURL('/news/2');
    await expect(page.locator('ol')).toHaveAttribute('start', '31');
    await expect(page.locator('a.prev')).toBeVisible();
});

test('opens an item and renders its nested comments', async ({ page }) => {
    await page.goto('/news/1');

    await page.locator('li.post').first().locator('.subtext-laptop a[href^="/item/"]').click();

    await expect(page).toHaveURL(/\/item\/\d+$/);
    await expect(page.locator('.laptop a.title')).toHaveText('An item with comments');
    await expect(page.getByText('A top level comment')).toBeVisible();
    await expect(page.getByText('A nested reply')).toBeVisible();

    // Collapsing the top level comment hides its content and its replies.
    await page.locator('.comment-list .collapse').first().click();
    await expect(page.getByText('A nested reply')).toBeHidden();
    await expect(page.locator('.comment-list .collapse').first()).toHaveText('[+]');
});

test('opens a user profile from a comment', async ({ page }) => {
    await page.goto('/item/42');

    await page.locator('.comment-list').getByRole('link', { name: 'commenter' }).click();

    await expect(page).toHaveURL('/user/commenter');
    await expect(page.locator('.profile .name')).toHaveText('commenter');
    await expect(page.locator('.profile')).toContainText('4321 ★');
    await expect(page.getByText('All about the author')).toBeVisible();
});

test('toggles the settings modal and applies a theme', async ({ page }) => {
    await page.goto('/news/1');

    await expect(page.locator('#popup1')).toHaveCount(0);
    await page.locator('img.settings').click();
    await expect(page.locator('#popup1')).toBeVisible();

    await page.getByRole('radio', { name: 'Night' }).check();
    await expect(page.locator('div.night')).toBeVisible();

    await page.getByRole('radio', { name: 'Black (AMOLED)' }).check();
    await expect(page.locator('div.amoledblack')).toBeVisible();

    await page.locator('.popup .close').click();
    await expect(page.locator('#popup1')).toHaveCount(0);

    // The theme survives a reload because it is persisted in localStorage.
    await page.reload();
    await expect(page.locator('div.amoledblack')).toBeVisible();
});
