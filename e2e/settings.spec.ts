import { expect, test } from '@playwright/test';
import { stubHackerNewsApi } from './fixtures/hnApi';

test.beforeEach(async ({ page }) => {
    await stubHackerNewsApi(page);
});

test('switching themes persists across a reload', async ({ page }) => {
    await page.goto('/news/1');

    const appRoot = page.locator('#root > div');
    await expect(appRoot).toHaveClass('default');

    await page.getByAltText('Settings').click();
    await page.getByLabel('Night').check();

    await expect(appRoot).toHaveClass('night');
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('night');

    await page.getByRole('button', { name: 'Close settings' }).click();
    await expect(page.locator('#popup1')).toHaveCount(0);

    await page.reload();

    await expect(page.locator('#root > div')).toHaveClass('night');

    await page.getByAltText('Settings').click();
    await page.getByLabel('Black (AMOLED)').check();

    await expect(page.locator('#root > div')).toHaveClass('amoledblack');

    await page.reload();

    await expect(page.locator('#root > div')).toHaveClass('amoledblack');
});

test('font size and list spacing settings apply to the feed', async ({ page }) => {
    await page.goto('/news/1');

    await page.getByAltText('Settings').click();
    await page.getByLabel('Font size:').fill('24');
    await page.getByLabel('List spacing:').fill('12');
    await page.getByRole('button', { name: 'Close settings' }).click();

    await expect(page.locator('li.post a.title').first()).toHaveCSS('font-size', '24px');
    await expect(page.locator('li.post > div').first()).toHaveCSS('margin-bottom', '12px');

    await page.reload();

    await expect(page.locator('li.post a.title').first()).toHaveCSS('font-size', '24px');
});
