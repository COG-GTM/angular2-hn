import { expect, test } from './fixtures';

async function openSettings(page: import('@playwright/test').Page) {
    await page.locator('img.settings').click();
    await expect(page.locator('.popup')).toBeVisible();
}

test('opens and closes the settings panel', async ({ page }) => {
    await page.goto('/news/1');
    await openSettings(page);

    await page.locator('.popup .close').click();
    await expect(page.locator('.popup')).toBeHidden();
});

test('applies and persists the selected theme', async ({ page }) => {
    await page.goto('/news/1');
    await openSettings(page);

    await page.getByLabel('Night').check();
    await expect(page.locator('#root > div').first()).toHaveClass('night');

    await page.reload();
    await expect(page.locator('#root > div').first()).toHaveClass('night');
});

test('applies and persists the title font size', async ({ page }) => {
    await page.goto('/news/1');
    await openSettings(page);

    const title = page.locator('ol > li a.title').first();
    await expect(title).toHaveCSS('font-size', '16px');

    await page.getByLabel('Font size:').fill('24');
    await expect(title).toHaveCSS('font-size', '24px');

    await page.reload();
    await expect(title).toHaveCSS('font-size', '24px');
});

test('applies and persists the list spacing', async ({ page }) => {
    await page.goto('/news/1');
    await openSettings(page);

    const listItem = page.locator('ol > li .item-block > div').first();
    await expect(listItem).toHaveCSS('margin-bottom', '0px');

    await page.getByLabel('List spacing:').fill('12');
    await expect(listItem).toHaveCSS('margin-bottom', '12px');

    await page.reload();
    await expect(listItem).toHaveCSS('margin-bottom', '12px');
});

test('persists opening links in a new tab', async ({ page }) => {
    await page.goto('/news/1');
    const title = page.locator('ol > li a.title').first();
    await expect(title).not.toHaveAttribute('target', '_blank');

    await openSettings(page);
    await page.getByRole('checkbox').check();
    await page.locator('.popup .close').click();

    await expect(title).toHaveAttribute('target', '_blank');
    await expect(title).toHaveAttribute('rel', 'noopener');

    await page.reload();
    await expect(title).toHaveAttribute('target', '_blank');
});
