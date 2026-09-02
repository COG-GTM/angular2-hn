import { expect, test } from '@playwright/test';

test('redirects / to /news/1 inside the theme wrapper', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(page.locator('.wrapper')).toBeVisible();
});
