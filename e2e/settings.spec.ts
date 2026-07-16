import { expect, test } from '@playwright/test';
import { installHnMocks } from './mocks';

test.beforeEach(async ({ page }) => {
    await installHnMocks(page);
});

test('changes theme, font and spacing and persists them across reload', async ({ page }) => {
    await page.goto('/news/1');
    await expect(page.getByText('news story 1', { exact: true })).toBeVisible();

    await page.getByAltText('Settings').click();
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

    await page.getByRole('radio', { name: 'Night' }).check();
    await page.getByRole('spinbutton', { name: /Font size/ }).fill('22');
    await page.getByRole('spinbutton', { name: /List spacing/ }).fill('7');

    await expect.poll(() => page.evaluate(() => localStorage.getItem('theme'))).toBe('night');
    await expect.poll(() => page.evaluate(() => localStorage.getItem('titleFontSize'))).toBe('22');
    await expect.poll(() => page.evaluate(() => localStorage.getItem('listSpacing'))).toBe('7');

    await page.reload();
    await expect(page.getByText('news story 1', { exact: true })).toBeVisible();

    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('night');
    await page.getByAltText('Settings').click();
    await expect(page.getByRole('radio', { name: 'Night' })).toBeChecked();
    await expect(page.getByRole('spinbutton', { name: /Font size/ })).toHaveValue('22');
    await expect(page.getByRole('spinbutton', { name: /List spacing/ })).toHaveValue('7');
});

test('toggling open-links-in-new-tab sets target=_blank on story links', async ({ page }) => {
    await page.goto('/news/1');
    const firstTitle = page.getByRole('link', { name: 'news story 1', exact: true });
    await expect(firstTitle).not.toHaveAttribute('target', '_blank');

    await page.getByAltText('Settings').click();
    await page.getByRole('checkbox').check();
    await page.getByText('×').click();

    await expect(firstTitle).toHaveAttribute('target', '_blank');
    await expect(firstTitle).toHaveAttribute('rel', 'noopener');
});
