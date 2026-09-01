import { expect, test } from '@playwright/test';

import { installApiMocks } from './fixtures';

test('renders a user profile', async ({ page }) => {
    await installApiMocks(page);

    await page.goto('/user/pg');

    await expect(page.locator('.title-block')).toHaveText('Profile: pg');
    await expect(page.getByText('12345 ★')).toBeVisible();
    await expect(page.getByText('Created 3 years ago')).toBeVisible();
    await expect(page.locator('.other-details strong')).toHaveText('Profile about');
});
