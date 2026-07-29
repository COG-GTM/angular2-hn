import { expect, test } from '@playwright/test';

test.describe('Vantage cashback app', () => {
    test('dashboard headlines the 4% rate with balances and recent cashback', async ({ page }) => {
        await page.goto('/');

        await expect(page).toHaveURL(/\/dashboard$/);
        await expect(page.getByTestId('cashback-rate')).toHaveText('4%');
        await expect(page.getByRole('heading', { name: /4% cash back on every purchase/i })).toBeVisible();
        await expect(page.getByTestId('total-cashback')).toHaveText(/^\$\d/);
        await expect(page.getByTestId('current-balance')).toHaveText(/^\$\d/);
        await expect(page.locator('.list-row').first()).toContainText('back');
    });

    test('transactions list shows per-transaction cashback and filters by category', async ({ page }) => {
        await page.goto('/transactions');

        const rows = page.locator('.list-row');
        await expect(rows.first()).toContainText('4%');
        const totalRows = await rows.count();

        await page.getByRole('button', { name: 'Dining' }).click();

        await expect(rows).not.toHaveCount(totalRows);
        await expect(page.getByTestId('filtered-cashback')).toHaveText(/^\$\d/);
    });

    test('transaction details explain the 4% calculation', async ({ page }) => {
        await page.goto('/transactions');
        await page.locator('.list-row').first().click();

        await expect(page).toHaveURL(/\/transactions\/txn-\d+$/);
        await expect(page.getByRole('heading', { name: 'How this was calculated' })).toBeVisible();
        await expect(page.locator('.calculation')).toContainText('× 4% =');
        await expect(page.getByTestId('transaction-cashback')).toHaveText(/^\$\d/);
    });

    test('rewards page breaks cashback down by category', async ({ page }) => {
        await page.goto('/rewards');

        await expect(page.getByTestId('cashback-rate')).toHaveText('4%');
        await expect(page.getByTestId('category-row').first()).toContainText('of cash back');
        expect(await page.getByTestId('category-row').count()).toBeGreaterThan(1);
    });

    test('settings overlay stays readable in every theme', async ({ page }) => {
        for (const theme of ['default', 'night', 'amoledblack']) {
            await page.goto('/dashboard');
            await page.evaluate((value) => localStorage.setItem('theme', value), theme);
            await page.reload();
            await page.getByRole('button', { name: /settings/i }).click();

            const popup = page.locator('.popup');
            await expect(popup.getByRole('heading', { name: 'Settings' })).toBeVisible();
            const [color, background] = await popup.evaluate((element) => {
                const styles = getComputedStyle(element);
                return [styles.color, styles.backgroundColor];
            });
            expect(color).not.toBe(background);
        }
    });

    test('card page lists accounts and keeps the theme engine', async ({ page }) => {
        await page.goto('/account');

        await expect(page.getByRole('heading', { name: /Vantage 4% Cash Card/ }).first()).toBeVisible();
        await page.getByLabel('Night').check();

        await expect(page.locator('div.night')).toBeVisible();
    });
});
