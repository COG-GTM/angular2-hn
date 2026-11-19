import type { Page } from '@playwright/test';
import { expect, test } from '../fixtures';

const THEME_BACKGROUND = {
    Default: 'rgb(255, 255, 255)',
    Night: 'rgb(55, 71, 79)',
    'Black (AMOLED)': 'rgb(0, 0, 0)',
} as const;

// Colour of the page backdrop next to the centred content column.
const backdropColor = (page: Page) =>
    page.evaluate(() => getComputedStyle(document.elementFromPoint(5, innerHeight - 5)!).backgroundColor);

async function selectTheme(page: Page, theme: keyof typeof THEME_BACKGROUND) {
    await openSettings(page);
    await page.getByRole('radio', { name: theme }).check();
    await page.getByText('×', { exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeHidden();
    await expect.poll(() => backdropColor(page)).toBe(THEME_BACKGROUND[theme]);
}

async function openSettings(page: Page) {
    await page.getByRole('img', { name: 'Settings' }).click();
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
}

test.describe('settings', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/news/1');
        await expect(page.getByRole('list').first().getByRole('listitem').first()).toBeVisible();
    });

    test('opens and closes the settings popup', async ({ page }) => {
        await openSettings(page);
        await expect(page.getByRole('radio', { name: 'Default' })).toBeChecked();
        await expect(page.getByRole('checkbox')).not.toBeChecked();
        await page.getByText('×', { exact: true }).click();
        await expect(page.getByRole('heading', { name: 'Settings' })).toBeHidden();
    });

    test('theme toggle recolours the app and survives a reload', async ({ page }) => {
        expect(await backdropColor(page)).toBe(THEME_BACKGROUND.Default);

        await selectTheme(page, 'Night');
        await selectTheme(page, 'Black (AMOLED)');
        await selectTheme(page, 'Night');

        await page.reload();
        await expect.poll(() => backdropColor(page)).toBe(THEME_BACKGROUND.Night);
        await openSettings(page);
        await expect(page.getByRole('radio', { name: 'Night' })).toBeChecked();
        await page.getByText('×', { exact: true }).click();

        await selectTheme(page, 'Default');
    });

    test('"Open links in a new tab" makes story links open in a new tab', async ({ page }) => {
        const title = page.getByRole('list').first().getByRole('listitem').first().getByRole('link').first();
        await expect(title).not.toHaveAttribute('target', '_blank');
        await openSettings(page);
        await page.getByRole('checkbox').check();
        await page.getByText('×', { exact: true }).click();
        await expect(title).toHaveAttribute('target', '_blank');
        await page.reload();
        await expect(title).toHaveAttribute('target', '_blank');
    });

    test('font size and list spacing change the story list', async ({ page }) => {
        const first = page.getByRole('list').first().getByRole('listitem').first();
        await expect(first.getByRole('link').first()).toHaveCSS('font-size', '16px');
        await openSettings(page);

        const fontSize = page.getByRole('spinbutton', { name: 'Font size:' });
        await fontSize.selectText();
        await fontSize.pressSequentially('22');
        await expect(first.getByRole('link').first()).toHaveCSS('font-size', '22px');

        const firstTop = await page.getByRole('list').first().getByRole('listitem').nth(1).boundingBox();
        const spacing = page.getByRole('spinbutton', { name: 'List spacing:' });
        await spacing.selectText();
        await spacing.pressSequentially('40');
        await expect
            .poll(async () => (await page.getByRole('list').first().getByRole('listitem').nth(1).boundingBox())!.y)
            .toBeGreaterThan(firstTop!.y + 30);
    });
});
