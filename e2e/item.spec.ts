import { expect, test } from '@playwright/test';
import { ITEM, mockApi } from './mockApi';

test.beforeEach(async ({ page }) => {
    await mockApi(page);
});

test('opens item details with nested comments from the feed', async ({ page }) => {
    await page.goto('/news/1');
    await page
        .getByRole('link', { name: 'discuss' })
        .or(page.getByRole('link', { name: '1 comment' }))
        .first()
        .click();
    await expect(page).toHaveURL(new RegExp(`/item/${ITEM.id}$`));
    await expect(page.getByText('Item with nested comments').locator('visible=true').first()).toBeVisible();
    await expect(page.getByText('Top level comment')).toBeVisible();
    await expect(page.getByText('Nested reply')).toBeVisible();
    await expect(page.getByText('Deep reply')).toBeVisible();
});

test('collapses and expands a comment subtree', async ({ page }) => {
    await page.goto(`/item/${ITEM.id}`);
    await expect(page.getByText('Nested reply')).toBeVisible();

    await page.getByText('[-]').first().click();
    await expect(page.getByText('Top level comment')).toBeHidden();
    await expect(page.getByText('Nested reply')).toBeHidden();

    await page.getByText('[+]').first().click();
    await expect(page.getByText('Nested reply')).toBeVisible();
});

test('supports the ?id= query string form', async ({ page }) => {
    await page.goto(`/item?id=${ITEM.id}`);
    await expect(page.getByText('Top level comment')).toBeVisible();
});
