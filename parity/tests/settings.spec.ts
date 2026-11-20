import { expect, test } from '@playwright/test';
import { snap, useFixtures } from './helpers';

test.beforeEach(async ({ page }) => useFixtures(page));

test('settings panel switches theme and persists it across reloads', async ({ page }, testInfo) => {
  await page.goto('/news/1');
  await page.locator('img.settings').click();
  await expect(page.locator('app-settings h1')).toHaveText('Settings');
  await snap(page, testInfo, 'settings-open');
  await page.locator('input[name="theme"][value="night"]').check();
  await expect(page.locator('app-root > div.night')).toBeVisible();
  await page.locator('app-settings .close').click();
  await expect(page.locator('app-settings')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('app-root > div.night')).toBeVisible();
  await expect(page.locator('li.post')).toHaveCount(30);
  await snap(page, testInfo, 'news-1-night');
});

test('open-links-in-new-tab adds target=_blank to story links', async ({ page }) => {
  await page.goto('/news/1');
  const external = page.locator('li.post a.title[href^="http"]').first();
  await expect(external).not.toHaveAttribute('target', '_blank');
  await page.locator('img.settings').click();
  await page.locator('app-settings input[type="checkbox"]').first().check();
  await expect(external).toHaveAttribute('target', '_blank');
});
