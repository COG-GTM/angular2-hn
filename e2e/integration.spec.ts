/// <reference lib="dom" />
import { expect, test } from '@playwright/test';

import { item, mockHnApi, story } from './fixtures';

test.beforeEach(async ({ page }) => {
    await mockHnApi(page);
});

const visibleTitle = (page: import('@playwright/test').Page) =>
    page.locator('.feed-item a.title').filter({ visible: true }).first();

test.describe('settings popup drives the feed', () => {
    test('font size, list spacing and open-in-new-tab apply to feed items and persist', async ({ page }) => {
        await page.goto('/news/1');
        await expect(visibleTitle(page)).toHaveCSS('font-size', '16px');
        await expect(visibleTitle(page)).not.toHaveAttribute('target', '_blank');

        await page.locator('img.settings').click();
        const dialog = page.getByRole('dialog', { name: 'Settings' });
        await dialog.getByLabel('Font size:').fill('22');
        await dialog.getByLabel('List spacing:').fill('12');
        await dialog.getByLabel('Open links in a new tab').check();
        await dialog.locator('.close').click();
        await expect(dialog).toHaveCount(0);

        await expect(visibleTitle(page)).toHaveCSS('font-size', '22px');
        await expect(page.locator('.feed-item > div').first()).toHaveCSS('margin-bottom', '12px');
        await expect(visibleTitle(page)).toHaveAttribute('target', '_blank');
        await expect(visibleTitle(page)).toHaveAttribute('rel', 'noopener noreferrer');

        expect(
            await page.evaluate(() => [
                localStorage.getItem('titleFontSize'),
                localStorage.getItem('listSpacing'),
                localStorage.getItem('openLinkInNewTab'),
            ])
        ).toEqual(['22', '12', 'true']);

        await page.reload();
        await expect(visibleTitle(page)).toHaveCSS('font-size', '22px');
        await expect(visibleTitle(page)).toHaveAttribute('target', '_blank');

        // Item-details titles keep Angular's fixed 16px.
        await page.goto(`/item/${item.id}`);
        await expect(
            page.locator('.item').getByRole('link', { name: story.title }).filter({ visible: true }).first()
        ).toHaveCSS('font-size', '16px');
    });

    test('Escape closes the popup and returns focus to the cog', async ({ page }) => {
        await page.goto('/news/1');
        const cog = page.locator('img.settings');
        await cog.focus();
        await page.keyboard.press('Enter');
        const dialog = page.getByRole('dialog', { name: 'Settings' });
        await expect(dialog).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(dialog).toHaveCount(0);
        await expect(cog).toBeFocused();
    });
});

test.describe('username links', () => {
    test('feed username opens the user profile', async ({ page }) => {
        await page.goto('/news/1');
        await page.getByRole('link', { name: story.user, exact: true }).filter({ visible: true }).first().click();
        await expect(page).toHaveURL(new RegExp(`/user/${story.user}$`));
        await expect(page.getByTestId('user-profile')).toBeVisible();
    });

    test('comment username opens the user profile', async ({ page }) => {
        await page.goto(`/item/${item.id}`);
        await page
            .locator('.comment-list')
            .getByRole('link', { name: item.comments[0].user, exact: true })
            .filter({ visible: true })
            .first()
            .click();
        await expect(page).toHaveURL(new RegExp(`/user/${item.comments[0].user}$`));
        await expect(page.getByTestId('user-profile')).toBeVisible();
    });
});
