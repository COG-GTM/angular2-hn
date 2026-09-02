import { expect, test } from '@playwright/test';

import { installApiMocks } from './fixtures';

test.describe('item details', () => {
    test('opens an item from its comment link and collapses comments', async ({ page }) => {
        await installApiMocks(page);

        await page.goto('/news/1');
        await page.locator('a[href="/item/1"]:visible').first().click();
        await expect(page).toHaveURL(/\/item\/1$/);
        await expect(page.locator('a.title:visible').first()).toHaveText('Story 1');
        await expect(page.getByText('Top-level comment')).toBeVisible();

        await page.getByText('[-]').first().click();
        await expect(page.getByText('[+]').first()).toBeVisible();
        await expect(page.locator('.comment-tree > div').first()).toHaveAttribute('hidden', '');
        await expect(page.getByText('Top-level comment')).toBeHidden();

        await page.getByText('[+]').first().click();
        await expect(page.getByText('Top-level comment')).toBeVisible();
        await expect(page.getByText('Comment Deleted')).toBeVisible();
    });

    test('returns to the feed with the mobile back button', async ({ page }) => {
        await page.setViewportSize({ width: 500, height: 800 });
        await installApiMocks(page);

        await page.goto('/news/1');
        await page.locator('a[href="/item/1"]:visible').first().click();
        await expect(page.getByText('Top-level comment')).toBeVisible();

        await page.locator('.back-button').click();
        await expect(page).toHaveURL(/\/news\/1$/);
    });
});
