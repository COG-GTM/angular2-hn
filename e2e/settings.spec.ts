import { expect, test } from '@playwright/test';
import { mockApi } from './mockApi';

test.beforeEach(async ({ page }) => {
    await mockApi(page);
});

test('opens and closes the settings overlay from the header cog', async ({ page }) => {
    await page.goto('/news/1');
    await expect(page.locator('.overlay')).toHaveCount(0);

    await page.locator('.info img.settings').click();
    await expect(page.locator('.overlay .popup h1')).toHaveText('Settings');

    await page.locator('.popup .close').click();
    await expect(page.locator('.overlay')).toHaveCount(0);
});

test('switches themes and persists the choice', async ({ page }) => {
    await page.goto('/news/1');
    await page.locator('.info img.settings').click();

    await page.getByRole('radio', { name: 'Night' }).check();
    await expect(page.locator('#root > div').first()).toHaveClass('night');

    await page.getByRole('radio', { name: 'Black (AMOLED)' }).check();
    await expect(page.locator('#root > div').first()).toHaveClass('amoledblack');
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('amoledblack');

    await page.reload();
    await expect(page.locator('#root > div').first()).toHaveClass('amoledblack');
});

test('applies the title font size and list spacing settings', async ({ page }) => {
    await page.goto('/news/1');
    await page.locator('.info img.settings').click();

    await page.getByLabel('Font size:').fill('24');
    await page.getByLabel('List spacing:').fill('12');
    await page.locator('.popup .close').click();

    const firstRow = page.locator('li.post .item-block').first();
    await expect(firstRow).toHaveCSS('margin-bottom', '12px');
    await expect(firstRow.locator('a.title')).toHaveCSS('font-size', '24px');

    await page.reload();
    await expect(page.locator('li.post .item-block').first().locator('a.title')).toHaveCSS('font-size', '24px');
});

test('opens story links in a new tab when the preference is enabled', async ({ page }) => {
    await page.goto('/news/1');
    const firstTitle = page.locator('li.post a.title').first();
    await expect(firstTitle).not.toHaveAttribute('target', '_blank');

    await page.locator('.info img.settings').click();
    await page.getByRole('checkbox').check();
    await page.locator('.popup .close').click();

    await expect(firstTitle).toHaveAttribute('target', '_blank');
    await expect(firstTitle).toHaveAttribute('rel', 'noopener');
    expect(await page.evaluate(() => localStorage.getItem('openLinkInNewTab'))).toBe('true');
});

test('honours the system dark colour scheme on first visit', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/news/1');

    await expect(page.locator('#root > div').first()).toHaveClass('night');
});
