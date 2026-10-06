import { expect, test } from '@playwright/test';
import { mockApi } from './mockApi';

test.use({ colorScheme: 'light' });

test.beforeEach(async ({ page }) => {
    await mockApi(page);
});

test('switches themes from the settings dialog and persists them across reloads', async ({ page }) => {
    await page.goto('/news/1');
    await expect(page.locator('body')).toHaveClass(/\bdefault\b/);

    await page.getByRole('button', { name: 'Settings' }).click();
    const dialog = page.getByRole('dialog', { name: 'Settings' });
    await expect(dialog).toBeVisible();

    await dialog.getByLabel('Night').check();
    await expect(page.locator('body')).toHaveClass(/\bnight\b/);
    const nightBackground = await page.locator('.wrapper').evaluate((el) => getComputedStyle(el).backgroundColor);

    await dialog.getByLabel('Black (AMOLED)').check();
    await expect(page.locator('body')).toHaveClass(/\bamoledblack\b/);
    const amoledBackground = await page.locator('.wrapper').evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(amoledBackground).not.toBe(nightBackground);

    await page.getByRole('button', { name: 'Close settings' }).click();
    await expect(dialog).toBeHidden();

    await page.reload();
    await expect(page.locator('body')).toHaveClass(/\bamoledblack\b/);

    await page.getByRole('button', { name: 'Settings' }).click();
    await page.getByRole('dialog', { name: 'Settings' }).getByLabel('Default').check();
    await expect(page.locator('body')).toHaveClass(/\bdefault\b/);
});

test('follows the system dark mode preference when no theme is saved', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'dark' });
    const page = await context.newPage();
    await mockApi(page);
    await page.goto('/news/1');
    await expect(page.locator('body')).toHaveClass(/\bnight\b/);
    await context.close();
});
