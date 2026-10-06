import { expect, test } from '@playwright/test';

const FEEDS = ['news', 'newest', 'show', 'ask', 'jobs'] as const;

test.describe('app shell routing', () => {
    test('redirects / to /news/1', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveURL(/\/news\/1$/);
        await expect(page.getByTestId('feed')).toHaveAttribute('data-feed-type', 'news');
    });

    for (const feed of FEEDS) {
        test(`deep link /${feed}/2 resolves the ${feed} feed`, async ({ page }) => {
            await page.goto(`/${feed}/2`);
            const feedEl = page.getByTestId('feed');
            await expect(feedEl).toHaveAttribute('data-feed-type', feed);
            await expect(feedEl).toHaveAttribute('data-page', '2');
        });
    }

    test('header navigation updates the URL and active link', async ({ page }) => {
        await page.goto('/news/1');
        const nav = page.getByRole('navigation');
        for (const [label, feed] of [
            ['new', 'newest'],
            ['show', 'show'],
            ['ask', 'ask'],
            ['jobs', 'jobs'],
        ] as const) {
            await nav.getByRole('link', { name: label, exact: true }).click();
            await expect(page).toHaveURL(new RegExp(`/${feed}/1$`));
            await expect(nav.getByRole('link', { name: label, exact: true })).toHaveClass(/active/);
            await expect(page.getByTestId('feed')).toHaveAttribute('data-feed-type', feed);
        }
        await page.getByRole('link', { name: 'Logo' }).click();
        await expect(page).toHaveURL(/\/news\/1$/);
    });

    test('item and user routes load', async ({ page }) => {
        await page.goto('/item/8863');
        await expect(page.getByTestId('item-details')).toHaveAttribute('data-item-id', '8863');
        await page.goto('/user/pg');
        await expect(page.getByTestId('user-profile')).toHaveAttribute('data-user-id', 'pg');
    });
});

test.describe('theming', () => {
    test('switches and persists themes from the settings dialog', async ({ page }) => {
        await page.goto('/news/1');
        const root = page.getByTestId('theme-root');
        await expect(root).toHaveClass('default');
        const headerBg = () => page.locator('#header').evaluate((el) => getComputedStyle(el).backgroundColor);
        expect(await headerBg()).toBe('rgb(185, 43, 39)');

        await page.getByRole('button', { name: 'Settings' }).click();
        const dialog = page.getByRole('dialog', { name: 'Settings' });
        await expect(dialog).toBeVisible();

        await dialog.getByRole('radio', { name: 'Night' }).check();
        await expect(root).toHaveClass('night');
        expect(await headerBg()).toBe('rgb(38, 50, 56)');

        await dialog.getByRole('radio', { name: 'Black (AMOLED)' }).check();
        await expect(root).toHaveClass('amoledblack');
        expect(await headerBg()).toBe('rgb(0, 0, 0)');

        await dialog.getByRole('button', { name: 'Close settings' }).click();
        await expect(dialog).toBeHidden();

        await page.reload();
        await expect(root).toHaveClass('amoledblack');
        expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('amoledblack');
    });

    test('defaults to the night theme when the OS prefers dark mode', async ({ page }) => {
        await page.emulateMedia({ colorScheme: 'dark' });
        await page.goto('/news/1');
        await expect(page.getByTestId('theme-root')).toHaveClass('night');
    });
});
