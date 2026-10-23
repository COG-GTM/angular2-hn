/// <reference lib="dom" />
import { expect, test } from '@playwright/test';

import { mockHnApi } from './fixtures';

const themeClass = (page: import('@playwright/test').Page) =>
    page.evaluate(() => document.querySelector('#root > div')?.className ?? '');

test.beforeEach(async ({ page }) => {
    await mockHnApi(page);
});

test.describe('settings persistence (SettingsProvider)', () => {
    for (const theme of ['default', 'night', 'amoledblack']) {
        test(`stored theme "${theme}" is applied to the app theme wrapper after reload`, async ({ page }) => {
            await page.goto('/news/1');
            await page.evaluate((value) => localStorage.setItem('theme', value), theme);
            await page.reload();
            await expect(page.locator('#root > div').first()).toHaveClass(new RegExp(`(^|\\s)${theme}(\\s|$)`));
        });
    }

    test('first visit derives the theme from prefers-color-scheme and persists it', async ({ browser }) => {
        const context = await browser.newContext({ colorScheme: 'dark', serviceWorkers: 'block' });
        const page = await context.newPage();
        await mockHnApi(page);
        await page.goto('/news/1');
        await expect(page.locator('#root > div').first()).toHaveClass(/(^|\s)night(\s|$)/);
        expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('night');
        await context.close();
    });
});

test.describe('settings popup (real components)', () => {
    test('switching the theme in the popup persists across reloads', async ({ page }) => {
        await page.goto('/news/1');
        await page.locator('img.settings').click();
        const dialog = page.locator('#popup1');
        await expect(dialog).toBeVisible();

        await dialog.getByLabel('Night').check();
        await expect(page.locator('#root > div').first()).toHaveClass(/(^|\s)night(\s|$)/);
        expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('night');

        await dialog.locator('.close').click();
        await expect(dialog).toHaveCount(0);

        await page.reload();
        expect(await themeClass(page)).toMatch(/(^|\s)night(\s|$)/);

        await page.locator('img.settings').click();
        await page.locator('#popup1').getByLabel('Black (AMOLED)').check();
        await page.reload();
        expect(await themeClass(page)).toMatch(/(^|\s)amoledblack(\s|$)/);
    });
});
