import { test, expect } from '@playwright/test';

test('redirects the root url to the first news page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/news\/1$/);
});

test('renders the header navigation links', async ({ page }) => {
    await page.goto('/news/1');
    await expect(page.getByRole('link', { name: 'new', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'show', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'ask', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'jobs', exact: true })).toBeVisible();
});

test('navigates to a feed section when a nav link is clicked', async ({ page }) => {
    await page.goto('/news/1');
    await page.getByRole('link', { name: 'show', exact: true }).click();
    await expect(page).toHaveURL(/\/show\/1$/);
});
