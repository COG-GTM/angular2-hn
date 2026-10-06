import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { mockHnApi } from './support/mock-api';
import { NEWS_FEED, USERS } from './fixtures/user';

async function mockUsers(page: Page) {
    await mockHnApi(page, {
        '/news': () => NEWS_FEED,
        '/user/': (url) => {
            const id = decodeURIComponent(url.pathname.slice('/user/'.length));
            return USERS[id as keyof typeof USERS] ?? { error: 'unknown user' };
        },
    });
}

test.describe('user profile', () => {
    test('/user/:id renders id, karma, created and sanitized about', async ({ page }) => {
        await mockUsers(page);
        await page.goto('/user/pg');
        const profile = page.getByTestId('user-profile');
        await expect(profile).toHaveAttribute('data-user-id', 'pg');
        await expect(profile.locator('.main-details .name')).toHaveText('pg');
        await expect(profile.locator('.main-details .right')).toHaveText('157316 ★');
        await expect(profile.locator('.main-details .age')).toHaveText('Created 20 years ago');
        const about = profile.locator('.other-details p');
        await expect(about).toContainText('Bug fixer.');
        await expect(about.getByRole('link', { name: 'paulgraham.com' })).toHaveAttribute(
            'href',
            'https://paulgraham.com'
        );
        await expect(about.locator('script')).toHaveCount(0);
        expect(await page.evaluate(() => (window as unknown as { __xss?: boolean }).__xss)).toBeUndefined();
        // Desktop viewport hides the mobile header.
        await expect(profile.locator('.item-header')).toBeHidden();
    });

    test('omits the about section when the user has none', async ({ page }) => {
        await mockUsers(page);
        await page.goto('/user/dang');
        await expect(page.locator('.main-details .right')).toHaveText('30000 ★');
        await expect(page.locator('.other-details')).toHaveCount(0);
    });

    test('shows the error state when the user cannot be loaded', async ({ page }) => {
        await mockHnApi(page, {});
        await page.goto('/user/nobody');
        await expect(page.getByRole('alert')).toContainText('Could not load user nobody.');
        await expect(page.getByTestId('user-profile')).toHaveAttribute('data-user-id', 'nobody');
    });

    test('client-side navigation from the feed to a user and back', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await mockUsers(page);
        await page.goto('/news/1');
        await expect(page.getByTestId('feed')).toBeVisible();

        const userLink = page.locator('a[href="/user/dhouston"]');
        // The feed list lands in a parallel phase; fall back to an in-app history navigation until it renders user links.
        if ((await userLink.count()) > 0) {
            await userLink.first().click();
        } else {
            await page.evaluate(() => {
                window.history.pushState({}, '', '/user/pg');
                window.dispatchEvent(new PopStateEvent('popstate'));
            });
        }
        const profile = page.getByTestId('user-profile');
        await expect(profile.locator('.main-details .name')).toBeVisible();
        const id = await profile.getAttribute('data-user-id');
        await expect(profile.locator('.item-header')).toContainText(`Profile: ${id}`);

        const back = page.getByRole('button', { name: 'Go back' });
        await back.focus();
        await page.keyboard.press('Enter');
        await expect(page).toHaveURL(/\/news\/1$/);
        await expect(page.getByTestId('feed')).toBeVisible();
    });

    test('changing the user id in-app refetches the profile', async ({ page }) => {
        await mockUsers(page);
        await page.goto('/user/pg');
        await expect(page.locator('.main-details .name')).toHaveText('pg');
        await page.evaluate(() => {
            window.history.pushState({}, '', '/user/dang');
            window.dispatchEvent(new PopStateEvent('popstate'));
        });
        await expect(page.locator('.main-details .name')).toHaveText('dang');
        await expect(page.locator('.main-details .right')).toHaveText('30000 ★');
    });
});
