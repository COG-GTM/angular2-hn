import { test, expect } from '@playwright/test';
import { mockApi, shot, waitForFeed } from './helpers';

test.beforeEach(async ({ page }) => mockApi(page));

async function openSettings(page) {
  await page.getByAltText('Settings').click();
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
}

test('settings popup opens and closes', async ({ page }, testInfo) => {
  await page.goto('/news/1');
  await waitForFeed(page);
  await openSettings(page);
  await expect(page.getByRole('heading', { name: 'Select a theme' })).toBeVisible();
  await expect(page.getByLabel('Default')).toBeChecked();
  await shot(page, testInfo, 'settings-open');
  await page.locator('.popup .close').click();
  await expect(page.getByRole('heading', { name: 'Settings' })).toHaveCount(0);
});

for (const [label, theme] of [['Night', 'night'], ['Black (AMOLED)', 'amoledblack']]) {
  test(`theme "${label}" applies and persists across reload`, async ({ page }, testInfo) => {
    await page.goto('/news/1');
    await waitForFeed(page);
    const root = page.locator('app-root > div').first();
    await expect(root).toHaveClass('default');
    const before = await page.locator('.body-cover').evaluate((e) => getComputedStyle(e).backgroundColor);
    await openSettings(page);
    await page.getByLabel(label).check();
    await expect(root).toHaveClass(theme);
    const after = await page.locator('.body-cover').evaluate((e) => getComputedStyle(e).backgroundColor);
    expect(after).not.toBe(before);
    await page.locator('.popup .close').click();
    await shot(page, testInfo, `theme-${theme}`);
    await page.reload();
    await waitForFeed(page);
    await expect(root).toHaveClass(theme);
  });
}

test('font size and list spacing change the feed layout and persist', async ({ page }, testInfo) => {
  await page.goto('/news/1');
  await waitForFeed(page);
  const title = page.locator('li.post a.title').first();
  await expect(title).toHaveCSS('font-size', '16px');
  await openSettings(page);
  const font = page.getByLabel('Font size:');
  await font.fill('22');
  await font.press('Enter');
  const spacing = page.getByLabel('List spacing:');
  await spacing.fill('12');
  await spacing.press('Enter');
  await expect(title).toHaveCSS('font-size', '22px');
  await expect(page.locator('li.post item > div').first()).toHaveCSS('margin-bottom', '12px');
  await page.locator('.popup .close').click();
  await shot(page, testInfo, 'settings-font-spacing');
  await page.reload();
  await waitForFeed(page);
  await expect(page.locator('li.post a.title').first()).toHaveCSS('font-size', '22px');
});

test('"Open links in a new tab" sets target=_blank on story links', async ({ page }) => {
  await page.goto('/news/1');
  await waitForFeed(page);
  const external = page.locator('li.post a.title[href^="http"]').first();
  await expect(external).not.toHaveAttribute('target', /.*/);
  await openSettings(page);
  await page.getByRole('checkbox').check();
  await expect(external).toHaveAttribute('target', '_blank');
  await expect(external).toHaveAttribute('rel', 'noopener');
  await page.reload();
  await waitForFeed(page);
  await expect(page.locator('li.post a.title[href^="http"]').first()).toHaveAttribute('target', '_blank');
});
