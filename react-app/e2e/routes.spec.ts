import { expect, test } from '@playwright/test';

import { collectConsoleErrors, FEED_TYPES, item, mockHnApi, story, user } from './fixtures';

test.beforeEach(async ({ page }) => {
    await mockHnApi(page);
});

test.describe('routes (component roots)', () => {
    test('/ redirects to /news/1', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveURL(/\/news\/1$/);
        await expect(page.locator('.main-content.feed')).toBeVisible();
    });

    for (const feed of FEED_TYPES) {
        test(`/${feed}/1 renders the feed inside the shell`, async ({ page }) => {
            const errors = collectConsoleErrors(page);
            await page.goto(`/${feed}/1`);
            await expect(page).toHaveURL(new RegExp(`/${feed}/1$`));
            await expect(page.locator('#header')).toBeVisible();
            await expect(page.locator('.main-content.feed')).toBeVisible();
            await expect(page.locator('#footer')).toBeAttached();
            expect(errors).toEqual([]);
        });
    }

    test('/item/:id renders item details (lazy chunk)', async ({ page }) => {
        await page.goto(`/item/${item.id}`);
        await expect(page.locator('.main-content.item-page')).toBeVisible();
    });

    test('/user/:id renders the user profile (lazy chunk)', async ({ page }) => {
        await page.goto(`/user/${user.id}`);
        await expect(page.locator('.profile')).toBeVisible();
    });

    test('unknown URLs keep the URL and the empty shell (documented deviation)', async ({ page }) => {
        await page.goto('/nope');
        await expect(page).toHaveURL(/\/nope$/);
        await expect(page.locator('#header')).toBeVisible();
        await expect(page.locator('.main-content.feed')).toHaveCount(0);
    });
});

test.describe('routes (real components)', () => {
    test('feed lists 30 stories with title, domain and More link', async ({ page }) => {
        await page.goto('/news/1');
        await expect(page.locator('.post')).toHaveCount(30);
        await expect(page.getByRole('link', { name: story.title }).filter({ visible: true }).first()).toBeVisible();
        await expect(page.getByText(`(${story.domain})`).filter({ visible: true }).first()).toBeVisible();
        await page.locator('.nav .more').click();
        await expect(page).toHaveURL(/\/news\/2$/);
        await expect(page.locator('.post')).toHaveCount(30);
    });

    test('header logo and nav links switch feeds', async ({ page }) => {
        await page.goto('/news/1');
        for (const [label, feed] of [
            ['new', 'newest'],
            ['show', 'show'],
            ['ask', 'ask'],
            ['jobs', 'jobs'],
        ]) {
            await page.locator('.header-nav a', { hasText: label }).click();
            await expect(page).toHaveURL(new RegExp(`/${feed}/1$`));
            await expect(page.locator('.post').first()).toBeVisible();
        }
        await page.locator('a.home-link').click();
        await expect(page).toHaveURL(/\/news\/1$/);
    });

    test('item page shows the story and its comment tree', async ({ page }) => {
        await page.goto(`/item/${item.id}`);
        await expect(page.locator('.item')).toBeVisible();
        await expect(page.getByRole('link', { name: story.title }).filter({ visible: true }).first()).toBeVisible();
        await expect(page.locator('.comment-list')).toContainText('Fixture comment body');
        await expect(page.locator('.comment-list')).toContainText(item.comments[0].user);
    });

    test('unknown item shows the Angular error message', async ({ page }) => {
        await page.goto('/item/1');
        await expect(page.getByRole('alert')).toContainText('Could not load item comments.');
    });

    test('user page shows id, karma, created and about', async ({ page }) => {
        await page.goto(`/user/${user.id}`);
        await expect(page.locator('.profile')).toBeVisible();
        await expect(page.locator('.main-details .name')).toHaveText(user.id);
        await expect(page.locator('.profile')).toContainText(`${user.karma} ★`);
        await expect(page.locator('.profile')).toContainText(`Created ${user.created}`);
        await expect(page.locator('.profile')).toContainText('Fixture about text');
    });

    test('unknown user shows the Angular error message', async ({ page }) => {
        await page.goto('/user/nobody-here');
        await expect(page.getByRole('alert')).toContainText('Could not load user nobody-here.');
    });

    test('footer links to the GitHub project', async ({ page }) => {
        await page.goto('/news/1');
        await expect(page.locator('#footer a')).toHaveAttribute('href', 'https://github.com/hdjirdeh/angular2-hn');
    });
});
