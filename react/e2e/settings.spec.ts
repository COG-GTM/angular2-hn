import { expect, test } from '@playwright/test';

import { installApiMocks } from './fixtures';

test('applies settings to the layout and story list', async ({ page }) => {
    await installApiMocks(page);
    await page.goto('/news/1');
    await expect(page.getByText('Story 1').first()).toBeVisible();

    await page.getByRole('img', { name: 'Settings' }).click();
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

    await page.getByRole('radio', { name: 'Night' }).check();
    await expect(page.locator('div.night')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('night');

    await page.getByRole('radio', { name: 'Black (AMOLED)' }).check();
    await expect(page.locator('div.amoledblack')).toBeVisible();

    await page.getByRole('checkbox').check();
    await expect(page.locator('a.title').first()).toHaveAttribute('target', '_blank');

    const fontSize = page.getByRole('spinbutton', { name: /Font size/ });
    await fontSize.fill('20');
    await expect(page.locator('a.title').first()).toHaveCSS('font-size', '20px');

    const listSpacing = page.getByRole('spinbutton', { name: /List spacing/ });
    await listSpacing.fill('10');
    await expect(page.locator('.item-block > div').first()).toHaveCSS('margin-bottom', '10px');

    await page.getByText('×').click();
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeHidden();
});
