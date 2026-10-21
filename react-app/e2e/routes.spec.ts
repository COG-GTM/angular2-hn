import { expect, test } from '@playwright/test';

import { collectConsoleErrors, FEED_TYPES, item, mockHnApi, outlet, story, user } from './fixtures';

test.beforeEach(async ({ page }) => {
    await mockHnApi(page);
});

test.describe('routes (smoke, works with placeholder pages)', () => {
    test('/ redirects to /news/1', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveURL(/\/news\/1$/);
        await expect(outlet(page)).toBeAttached();
    });

    for (const path of [...FEED_TYPES.map((feed) => `/${feed}/1`), `/item/${item.id}`, `/user/${user.id}`]) {
        test(`${path} renders a page inside the shell without console errors`, async ({ page }) => {
            const errors = collectConsoleErrors(page);
            await page.goto(path);
            await expect(page).toHaveURL(new RegExp(`${path}$`));
            await expect(page.locator('#header')).toBeVisible();
            await expect(outlet(page)).toBeAttached();
            await expect(page.locator('#footer')).toBeAttached();
            expect(errors).toEqual([]);
        });
    }

    test('unknown URLs keep the URL and render the empty shell (Angular has no wildcard route)', async ({ page }) => {
        await page.goto('/nope');
        await expect(page).toHaveURL(/\/nope$/);
        await expect(page.locator('#header')).toBeVisible();
        await expect(outlet(page)).toHaveCount(0);
    });

    test('header logo and nav links navigate and mark the active link', async ({ page }) => {
        await page.goto('/news/3');
        for (const [label, feed] of [
            ['new', 'newest'],
            ['show', 'show'],
            ['ask', 'ask'],
            ['jobs', 'jobs'],
        ]) {
            const link = page.locator('.header-nav a', { hasText: label });
            await link.click();
            await expect(page).toHaveURL(new RegExp(`/${feed}/1$`));
            await expect(link).toHaveClass(/\bactive\b/);
            await expect(page.locator('.header-nav a.active')).toHaveCount(1);
        }
        await page.locator('a.home-link').click();
        await expect(page).toHaveURL(/\/news\/1$/);
        await expect(page.locator('a.home-link')).toHaveClass(/\bactive\b/);
        await expect(page.locator('.header-nav a.active')).toHaveCount(0);
    });

    test('footer links to the GitHub project (hidden on mobile)', async ({ page }) => {
        await page.goto('/news/1');
        await expect(page.locator('#footer a')).toHaveAttribute('href', 'https://github.com/hdjirdeh/angular2-hn');
        await expect(page.locator('#footer')).toBeVisible();
        await page.setViewportSize({ width: 375, height: 667 });
        await expect(page.locator('#footer')).toBeHidden();
    });
});

// fixme until Workstreams 2 (feeds) and 3 (item-details, user) are merged into the integration branch.
test.describe('feature pages (real components)', () => {
    test.fixme('feed lists 30 stories and paginates with More › / ‹ Prev', async ({ page }) => {
        await page.goto('/news/1');
        await expect(page.locator('.post')).toHaveCount(30);
        await expect(page.getByRole('link', { name: story.title }).filter({ visible: true }).first()).toBeVisible();
        await expect(page.getByText(`(${story.domain})`).filter({ visible: true }).first()).toBeVisible();
        await expect(page.locator('.nav .prev')).toHaveCount(0);
        await page.locator('.nav .more').click();
        await expect(page).toHaveURL(/\/news\/2$/);
        await expect(page.locator('.post')).toHaveCount(30);
        await expect(page.locator('ol')).toHaveAttribute('start', '31');
        await page.locator('.nav .prev').click();
        await expect(page).toHaveURL(/\/news\/1$/);
    });

    test.fixme('item page shows the story and its comment tree', async ({ page }) => {
        await page.goto(`/item/${item.id}`);
        await expect(page.locator('.item')).toBeVisible();
        await expect(page.getByRole('link', { name: story.title }).filter({ visible: true }).first()).toBeVisible();
        await expect(page.locator('.comment-list')).toContainText('Fixture comment body');
        await expect(page.locator('.comment-list')).toContainText(item.comments[0].user);
    });

    test.fixme('[-] collapses a comment subtree and [+] expands it', async ({ page }) => {
        await page.goto(`/item/${item.id}`);
        const toggle = page.locator('.comment-list .collapse').first();
        await expect(toggle).toHaveText('[-]');
        await expect(page.getByText('Fixture reply body')).toBeVisible();
        await toggle.click();
        await expect(toggle).toHaveText('[+]');
        await expect(page.getByText('Fixture comment body')).toBeHidden();
        await expect(page.getByText('Fixture reply body')).toBeHidden();
        await toggle.press('Enter');
        await expect(toggle).toHaveText('[-]');
        await expect(page.getByText('Fixture reply body')).toBeVisible();
    });

    test.fixme('unknown item shows the Angular error message', async ({ page }) => {
        await page.goto('/item/1');
        await expect(page.getByRole('alert')).toContainText('Could not load item comments.');
    });

    test.fixme('user page shows id, karma, created and about', async ({ page }) => {
        await page.goto(`/user/${user.id}`);
        await expect(page.locator('.profile')).toBeVisible();
        await expect(page.locator('.main-details .name')).toHaveText(user.id);
        await expect(page.locator('.profile')).toContainText(`${user.karma} ★`);
        await expect(page.locator('.profile')).toContainText(`Created ${user.created}`);
        await expect(page.locator('.profile')).toContainText('Fixture about text');
    });

    test.fixme('unknown user shows the Angular error message', async ({ page }) => {
        await page.goto('/user/nobody-here');
        await expect(page.getByRole('alert')).toContainText('Could not load user nobody-here.');
    });
});
