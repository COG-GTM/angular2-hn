import { expect, test } from '@playwright/test';
import { mockApi } from './mockApi';

test.beforeEach(async ({ page }) => {
    await mockApi(page);
});

test('opens an item from the feed and renders its comment tree', async ({ page }) => {
    await page.goto('/news/1');
    await page.locator('li.post').first().getByRole('link', { name: '1 comment' }).click();

    await expect(page).toHaveURL('/item/1001');
    await expect(page.locator('.item .subject')).toContainText('Story body paragraph.');
    await expect(page.locator('.comment-list > li')).toHaveCount(2);
    await expect(page.locator('.comment-list')).toContainText('Top level comment.');
    await expect(page.locator('.comment-list .subtree').first()).toContainText('Nested reply.');
});

test('collapses and expands a comment subtree', async ({ page }) => {
    await page.goto('/item/1001');

    const firstComment = page.locator('.comment-list > li').first();
    const toggle = firstComment.locator('.collapse').first();
    await expect(toggle).toHaveText('[-]');
    await expect(firstComment.getByText('Nested reply.')).toBeVisible();

    await toggle.click();
    await expect(toggle).toHaveText('[+]');
    await expect(firstComment.getByText('Nested reply.')).toBeHidden();

    await toggle.click();
    await expect(toggle).toHaveText('[-]');
    await expect(firstComment.getByText('Nested reply.')).toBeVisible();
});

test('navigates back to the feed with the back button', async ({ page }) => {
    // The back button only shows in the mobile header.
    await page.setViewportSize({ width: 375, height: 720 });
    await page.goto('/news/1');
    await page.locator('li.post').first().getByRole('link', { name: '1 comment' }).click();
    await expect(page).toHaveURL('/item/1001');

    await page.locator('.back-button').first().click();
    await expect(page).toHaveURL('/news/1');
});

test('shows the error view when the item request fails', async ({ page }) => {
    await page.route('**/node-hnapi.herokuapp.com/item/**', (route) => route.fulfill({ status: 500, body: '' }));
    await page.goto('/item/1001');

    await expect(page.locator('.error-section')).toContainText('Could not load item comments.');
});
