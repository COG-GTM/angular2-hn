import { expect, test } from '@playwright/test';

test('redirects the root route to the news feed', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/news\/1$/);
});

test('applies the theme class to the root wrapper', async ({ page }) => {
    await page.goto('/news/1');
    await expect(page.locator('#root > div').first()).toHaveClass(/default|night|amoledblack/);
});
