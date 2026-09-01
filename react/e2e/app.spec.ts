import { expect, test } from '@playwright/test';

test('redirects to the news feed', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(page.getByText('news feed page 1')).toBeVisible();
});
