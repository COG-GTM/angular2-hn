import { expect, test } from '@playwright/test';
import { installHnMocks } from './mocks';

test.beforeEach(async ({ page }) => {
    await installHnMocks(page);
});

test('opens an item detail and expands/collapses a comment', async ({ page }) => {
    await page.goto('/item/1000');
    await expect(page.getByText('This is the story body content.')).toBeVisible();
    await expect(page.getByText('Top level comment')).toBeVisible();
    await expect(page.getByText('Nested reply comment')).toBeVisible();

    const topToggle = page.getByText('[-]').first();
    await topToggle.click();
    await expect(page.getByText('Top level comment')).toBeHidden();

    await page.getByText('[+]').first().click();
    await expect(page.getByText('Top level comment')).toBeVisible();
});

test('opens a user profile', async ({ page }) => {
    await page.goto('/user/author');
    await expect(page.getByText('Created 7 years ago')).toBeVisible();
    await expect(page.getByText('4096 ★')).toBeVisible();
    await expect(page.getByText('Hello, I am a HN user.')).toBeVisible();
});
