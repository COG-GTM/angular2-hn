import { expect, test } from '@playwright/test';

test('renders the React placeholder', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Angular 2 HN — React')).toBeVisible();
});
