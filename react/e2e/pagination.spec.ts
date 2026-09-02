import { expect, test } from '@playwright/test';

import { installApiMocks } from './fixtures';

test.describe('pagination', () => {
    test('shows More on full pages and Prev after advancing', async ({ page }) => {
        await installApiMocks(page);

        await page.goto('/news/1');
        await expect(page.getByRole('link', { name: 'More ›' })).toBeVisible();
        await expect(page.getByRole('link', { name: '‹ Prev' })).toHaveCount(0);

        await page.getByRole('link', { name: 'More ›' }).click();
        await expect(page).toHaveURL(/\/news\/2$/);
        await expect(page.locator('ol')).toHaveAttribute('start', '31');
        await expect(page.getByRole('link', { name: '‹ Prev' })).toBeVisible();
    });

    test('hides More when a page contains fewer than thirty stories', async ({ page }) => {
        await installApiMocks(page);

        await page.goto('/news/3');

        await expect(page.getByText('Story 61').first()).toBeVisible();
        await expect(page.getByRole('link', { name: 'More ›' })).toHaveCount(0);
    });
});
