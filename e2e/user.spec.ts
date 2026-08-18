import { expect, test } from '@playwright/test';
import { STORY_ID, stubHackerNewsApi } from './fixtures/hnApi';

test.beforeEach(async ({ page }) => {
    await stubHackerNewsApi(page);
});

test('visiting a user page directly', async ({ page }) => {
    await page.goto('/user/testuser');

    await expect(page.locator('.profile .name')).toHaveText('testuser');
    await expect(page.locator('.profile .right')).toHaveText('4242 ★');
    await expect(page.locator('.profile .age')).toHaveText('Created 10 years ago');
    await expect(page.locator('.other-details')).toContainText('Just a test user');
});

test('navigating to a user page from a comment', async ({ page }) => {
    await page.goto(`/item/${STORY_ID}`);

    await page.getByRole('link', { name: 'top-commenter' }).click();

    await expect(page).toHaveURL('/user/top-commenter');
    await expect(page.locator('.profile .name')).toHaveText('top-commenter');
});
