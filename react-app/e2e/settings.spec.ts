/// <reference lib="dom" />
import { expect, test, type Page } from '@playwright/test';

import { mockHnApi } from './fixtures';

const THEMES = ['default', 'night', 'amoledblack'] as const;
const themeClass = (theme: string) => new RegExp(`(^|\\s)${theme}(\\s|$)`);
const stored = (page: Page, key: string) => page.evaluate((k) => localStorage.getItem(k), key);
const background = (page: Page, selector: string) =>
    page.locator(selector).evaluate((el) => getComputedStyle(el).backgroundColor);

test.beforeEach(async ({ page }) => {
    await mockHnApi(page);
});

test.describe('settings persistence (SettingsProvider)', () => {
    for (const theme of THEMES) {
        test(`stored theme "${theme}" is applied to <html> after reload`, async ({ page }) => {
            await page.goto('/news/1');
            await page.evaluate((value) => localStorage.setItem('theme', value), theme);
            await page.reload();
            await expect(page.locator('html')).toHaveClass(themeClass(theme));
        });
    }

    test('first visit derives the theme from prefers-color-scheme and persists it', async ({ browser }) => {
        const context = await browser.newContext({ colorScheme: 'dark', serviceWorkers: 'block' });
        const page = await context.newPage();
        await mockHnApi(page);
        await page.goto('/news/1');
        await expect(page.locator('html')).toHaveClass(themeClass('night'));
        expect(await stored(page, 'theme')).toBe('night');
        await context.close();
    });
});

test.describe('settings popup', () => {
    test('switching the theme restyles the whole app and persists across reloads', async ({ page }) => {
        await page.goto('/news/1');
        await page.evaluate(() => localStorage.setItem('theme', 'default'));
        await page.reload();
        const seen = new Set<string>();
        for (const [label, theme] of [
            ['Night', 'night'],
            ['Black (AMOLED)', 'amoledblack'],
            ['Default', 'default'],
        ] as const) {
            await page.locator('img.settings').click();
            const dialog = page.getByRole('dialog', { name: 'Settings' });
            await expect(dialog).toBeVisible();
            await dialog.getByLabel(label).check();
            await expect(page.locator('html')).toHaveClass(themeClass(theme));
            expect(await stored(page, 'theme')).toBe(theme);
            await page.locator('#popup1 .close').click();
            await expect(dialog).toHaveCount(0);

            await page.reload();
            await expect(page.locator('html')).toHaveClass(themeClass(theme));
            const colours = [
                await background(page, '.body-cover'),
                await background(page, '.wrapper'),
                await background(page, '#header'),
            ].join();
            seen.add(colours);
        }
        // Each theme paints the page body, the wrapper and the header differently.
        expect(seen.size).toBe(3);
    });

    test('font size, list spacing and open-in-new-tab persist across reloads', async ({ page }) => {
        await page.goto('/news/1');
        await page.locator('img.settings').click();
        const dialog = page.getByRole('dialog', { name: 'Settings' });
        await dialog.getByLabel('Font size:').fill('20');
        await dialog.getByLabel('List spacing:').fill('7');
        await dialog.getByRole('checkbox', { name: 'Open links in a new tab' }).check();
        expect(await stored(page, 'titleFontSize')).toBe('20');
        expect(await stored(page, 'listSpacing')).toBe('7');
        expect(await stored(page, 'openLinkInNewTab')).toBe('true');

        await page.reload();
        await page.locator('img.settings').click();
        await expect(dialog.getByLabel('Font size:')).toHaveValue('20');
        await expect(dialog.getByLabel('List spacing:')).toHaveValue('7');
        await expect(dialog.getByRole('checkbox', { name: 'Open links in a new tab' })).toBeChecked();
    });

    test('keyboard: cog opens, focus is trapped, Escape closes and focus returns to the cog', async ({ page }) => {
        await page.goto('/news/1');
        const cog = page.getByRole('button', { name: 'Settings' });
        await cog.focus();
        await page.keyboard.press('Enter');
        const dialog = page.getByRole('dialog', { name: 'Settings' });
        await expect(dialog).toHaveAttribute('aria-modal', 'true');
        await expect(page.getByRole('button', { name: 'Close settings' })).toBeFocused();

        for (let i = 0; i < 8; i++) {
            await page.keyboard.press('Tab');
            expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
        }
        await page.keyboard.press('Shift+Tab');
        expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);

        await page.keyboard.press('Escape');
        await expect(dialog).toHaveCount(0);
        await expect(cog).toBeFocused();

        await page.keyboard.press(' ');
        await expect(dialog).toBeVisible();
        await page.getByRole('button', { name: 'Close settings' }).press('Enter');
        await expect(dialog).toHaveCount(0);
    });

    test('the overlay covers the header, so only × closes the popup (Angular parity)', async ({ page }) => {
        await page.goto('/news/1');
        await page.locator('img.settings').click();
        const box = await page.locator('img.settings').boundingBox();
        const hit = await page.evaluate(
            ([x, y]) => document.elementFromPoint(x, y)?.id ?? '',
            [box!.x + box!.width / 2, box!.y + box!.height / 2]
        );
        expect(hit).toBe('popup1');
    });
});
