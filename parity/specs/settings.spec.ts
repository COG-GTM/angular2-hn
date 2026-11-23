import { test, expect, fixture, snap, MOBILE } from './support';

const headerBg = (page: import('@playwright/test').Page) =>
  page.locator('#header').evaluate((el) => getComputedStyle(el).backgroundColor);

test('settings popup opens from the cog and closes with ×', async ({ page }, testInfo) => {
  await page.goto('/news/1');
  await expect(page.locator('.popup')).toHaveCount(0);
  await page.locator('img.settings').click();
  await expect(page.locator('.popup h1')).toHaveText('Settings');
  for (const h of ['Links', 'Select a theme', 'Change Font']) await expect(page.locator('.popup h2', { hasText: h })).toBeVisible();
  await expect(page.locator('.popup input[value="default"]')).toBeChecked();
  await snap(page, testInfo, 'settings-default');
  await page.locator('.popup .close').click();
  await expect(page.locator('.popup')).toHaveCount(0);
});

for (const [label, theme, bg] of [
  ['Night', 'night', 'rgb(38, 50, 56)'],
  ['Black (AMOLED)', 'amoledblack', 'rgb(0, 0, 0)'],
] as const) {
  test(`theme ${theme} applies, persists and survives reload`, async ({ page }, testInfo) => {
    await page.goto('/news/1');
    expect(await headerBg(page)).toBe('rgb(185, 43, 39)');
    await page.locator('img.settings').click();
    await page.locator('.popup label', { hasText: label }).click();
    await expect.poll(() => headerBg(page)).toBe(bg);
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe(theme);
    await snap(page, testInfo, `settings-${theme}`);
    await page.locator('.popup .close').click();
    await page.reload();
    await expect.poll(() => headerBg(page)).toBe(bg);
    await snap(page, testInfo, `feed-news-1-${theme}`);
    await page.goto('/item/50614249');
    await expect(page.locator('.comment-list .meta').first()).toBeVisible();
    await snap(page, testInfo, `item-story-${theme}`);
  });
}

test('system dark mode selects night when no theme is saved', async ({ browser }, testInfo) => {
  const context = await browser.newContext({ colorScheme: 'dark', baseURL: testInfo.project.use.baseURL, serviceWorkers: 'block' });
  const page = await context.newPage();
  const { mockHnApi } = await import('./support');
  await mockHnApi(page);
  await page.goto('/news/1');
  await expect.poll(() => headerBg(page)).toBe('rgb(38, 50, 56)');
  await context.close();
});

test('open links in a new tab sets target on external links', async ({ page }) => {
  await page.goto('/news/1');
  await page.locator('img.settings').click();
  await page.locator('.popup input[type="checkbox"]').check();
  const link = page.locator('li.post a.title').first();
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', 'noopener');
  expect(await page.evaluate(() => localStorage.getItem('openLinkInNewTab'))).toBe('true');
  await page.reload();
  await expect(page.locator('li.post a.title').first()).toHaveAttribute('target', '_blank');
});

test('font size and list spacing apply to feed items and persist', async ({ page }, testInfo) => {
  await page.goto('/news/1');
  await page.locator('img.settings').click();
  const font = page.locator('.popup input[type="number"]').nth(0);
  const spacing = page.locator('.popup input[type="number"]').nth(1);
  await expect(font).toHaveValue('16');
  await expect(spacing).toHaveValue('0');
  await font.click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.type('22');
  await spacing.click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.type('12');
  await page.locator('.popup .close').click();
  const title = page.locator('li.post a.title').first();
  await expect.poll(() => title.evaluate((el) => getComputedStyle(el).fontSize)).toBe('22px');
  const block = page.locator('li.post .item-block > div').first();
  await expect.poll(() => block.evaluate((el) => getComputedStyle(el).marginBottom)).toBe('12px');
  expect(await page.evaluate(() => [localStorage.getItem('titleFontSize'), localStorage.getItem('listSpacing')])).toEqual(['22', '12']);
  await snap(page, testInfo, 'feed-news-1-font22-spacing12');
  await page.reload();
  await expect.poll(() => page.locator('li.post a.title').first().evaluate((el) => getComputedStyle(el).fontSize)).toBe('22px');
});

test('mobile settings popup', async ({ page }, testInfo) => {
  await page.setViewportSize(MOBILE);
  await page.goto('/news/1');
  await page.locator('img.settings').click();
  await expect(page.locator('.popup h1')).toHaveText('Settings');
  await snap(page, testInfo, 'mobile-settings');
});
