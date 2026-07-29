import { expect, test } from '@playwright/test';
import { mockApi } from './mockApi';

test.beforeEach(async ({ page }) => {
    await mockApi(page);
});

test('opens a user profile from a story row', async ({ page }) => {
    await page.goto('/news/1');
    await page.locator('li.post').first().getByRole('link', { name: 'author1' }).click();

    await expect(page).toHaveURL('/user/author1');
    await expect(page.locator('.profile .name')).toHaveText('author1');
    await expect(page.locator('.profile .right')).toContainText('4242');
    await expect(page.locator('.profile .age')).toContainText('Created October 1, 2010');
    await expect(page.locator('.profile .other-details')).toContainText('Just another Hacker News reader.');
});

test('shows the error view when the user request fails', async ({ page }) => {
    await page.route('**/node-hnapi.herokuapp.com/user/**', (route) => route.fulfill({ status: 404, body: '' }));
    await page.goto('/user/author1');

    await expect(page.locator('.error-section')).toContainText('Could not load user author1.');
});
