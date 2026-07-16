import { expect, test } from '@playwright/test';
import { installHnMocks } from './mocks';

test.beforeEach(async ({ page }) => {
    await installHnMocks(page);
});

test('redirects the root path to /news/1 and loads the feed', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(page.getByText('news story 1', { exact: true })).toBeVisible();
});

test('navigates to each feed from the header', async ({ page }) => {
    await page.goto('/news/1');
    await expect(page.getByText('news story 1', { exact: true })).toBeVisible();

    await page.getByRole('link', { name: 'new', exact: true }).click();
    await expect(page).toHaveURL(/\/newest\/1$/);
    await expect(page.getByText('newest story 1', { exact: true })).toBeVisible();

    await page.getByRole('link', { name: 'show', exact: true }).click();
    await expect(page).toHaveURL(/\/show\/1$/);
    await expect(page.getByText('show story 1', { exact: true })).toBeVisible();

    await page.getByRole('link', { name: 'ask', exact: true }).click();
    await expect(page).toHaveURL(/\/ask\/1$/);
    await expect(page.getByText('ask story 1', { exact: true })).toBeVisible();

    await page.getByRole('link', { name: 'jobs', exact: true }).click();
    await expect(page).toHaveURL(/\/jobs\/1$/);
    await expect(page.getByText('These are jobs at startups')).toBeVisible();
});

test('paginates a feed with the More link', async ({ page }) => {
    await page.goto('/news/1');
    await expect(page.getByText('news story 1', { exact: true })).toBeVisible();
    await page.getByRole('link', { name: /More/ }).click();
    await expect(page).toHaveURL(/\/news\/2$/);
    await expect(page.getByRole('link', { name: /Prev/ })).toBeVisible();
});
