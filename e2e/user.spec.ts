import { expect, test } from '@playwright/test';
import { mockApi, USER } from './mockApi';

test.beforeEach(async ({ page }) => {
    await mockApi(page);
});

test('renders a user profile', async ({ page }) => {
    await page.goto(`/user/${USER.id}`);
    await expect(page.getByText(String(USER.karma))).toBeVisible();
    await expect(page.getByText(USER.created)).toBeVisible();
    await expect(page.getByText('Bug fixer.')).toBeVisible();
});

test('navigates to a user profile from a story row', async ({ page }) => {
    await page.goto('/news/1');
    await page.getByRole('link', { name: 'user1', exact: true }).first().click();
    await expect(page).toHaveURL(/\/user\/user1$/);
    await expect(page.getByText('Bug fixer.')).toBeVisible();
});

test('supports the ?id= query string form', async ({ page }) => {
    await page.goto(`/user?id=${USER.id}`);
    await expect(page.getByText('Bug fixer.')).toBeVisible();
});
