import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { expect, Page, test } from '@playwright/test';

import { goOffline, mockApi, waitForCachedItem, waitForServiceWorker } from './fixtures';

const row = (page: Page, title: string) => page.locator('li.post', { hasText: title });
const toast = (page: Page) => page.locator('.toast');

test.beforeEach(async ({ context }) => {
  await mockApi(context);
});

test('shows an empty state when nothing is saved', async ({ page }) => {
  await page.goto('/saved');
  await expect(page.getByRole('heading', { name: 'No saved stories yet' })).toBeVisible();
});

test('save from a feed, view in /saved, remove with undo', async ({ page }) => {
  await page.goto('/news/1');

  const first = row(page, 'First mocked story').getByRole('button', { name: 'Save story' });
  await expect(first).toHaveAttribute('aria-pressed', 'false');
  await first.click();
  await expect(row(page, 'First mocked story').getByRole('button', { name: 'Remove from saved' })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  await expect(toast(page)).toContainText('Saved');

  // Keyboard: focus the button and press Space.
  const second = row(page, 'Second mocked story').getByRole('button', { name: 'Save story' });
  await second.focus();
  await page.keyboard.press('Space');
  await expect(row(page, 'Second mocked story').getByRole('button', { name: 'Remove from saved' })).toBeVisible();

  // Client-side navigation: no reload.
  await page.evaluate(() => ((window as any).__noReload = true));
  await page.locator('.header-nav').getByRole('link', { name: 'saved' }).click();
  await expect(page).toHaveURL(/\/saved$/);
  expect(await page.evaluate(() => (window as any).__noReload)).toBe(true);

  const titles = page.locator('.saved-story .title');
  await expect(titles).toHaveText(['Second mocked story', 'First mocked story']);

  // Remove, then undo.
  await row(page, 'Second mocked story').getByRole('button', { name: 'Remove from saved' }).click();
  await expect(titles).toHaveText(['First mocked story']);
  await expect(toast(page)).toContainText('Removed');
  await toast(page).getByRole('button', { name: 'Undo' }).click();
  await expect(titles).toHaveText(['Second mocked story', 'First mocked story']);

  // Remove without undo: toast disappears after 5 seconds and the removal sticks.
  await row(page, 'First mocked story').getByRole('button', { name: 'Remove from saved' }).click();
  await expect(toast(page)).toContainText('Removed');
  await expect(toast(page)).toBeHidden({ timeout: 7000 });
  await page.reload();
  await expect(titles).toHaveText(['Second mocked story']);
});

test('save and unsave from the item details page', async ({ page }) => {
  await page.goto('/item/102');
  const header = page.locator('.laptop');
  await header.getByRole('button', { name: 'Save story' }).click();
  await expect(header.getByRole('button', { name: 'Remove from saved' })).toHaveAttribute('aria-pressed', 'true');

  await page.goto('/saved');
  await expect(page.locator('.saved-story .title')).toHaveText(['Second mocked story']);

  await page.goto('/item/102');
  await header.getByRole('button', { name: 'Remove from saved' }).click();
  await expect(toast(page)).toContainText('Removed');
  await page.goto('/saved');
  await expect(page.getByRole('heading', { name: 'No saved stories yet' })).toBeVisible();
});

test('saved stories and their comments render offline', async ({ page, context }) => {
  await page.goto('/news/1');
  await waitForServiceWorker(page);

  await row(page, 'First mocked story').getByRole('button', { name: 'Save story' }).click();
  await row(page, 'Ask HN: Third mocked story').getByRole('button', { name: 'Save story' }).click();
  await waitForCachedItem(page, 101);
  await waitForCachedItem(page, 103);

  await goOffline(context);

  await page.goto('/saved');
  await expect(page.locator('.saved-story .title')).toHaveText(['Ask HN: Third mocked story', 'First mocked story']);

  await row(page, 'First mocked story').getByRole('link', { name: 'comments' }).click();
  await expect(page).toHaveURL(/\/item\/101$/);
  await expect(page.locator('.offline-notice')).toBeVisible();
  await expect(page.getByText('Top comment on 101')).toBeVisible();
  await expect(page.getByText('Nested reply on 101')).toBeVisible();

  await page.goto('/item/103');
  await expect(page.getByText('Nested reply on 103')).toBeVisible();
});

test('saved stories survive a browser restart and a service worker reset', async ({ playwright, baseURL }) => {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hn-saved-'));
  const launch = async () => {
    const ctx = await playwright.chromium.launchPersistentContext(userDataDir, {
      baseURL,
      executablePath: process.env.CHROME_BIN || undefined,
    });
    await mockApi(ctx);
    return ctx;
  };

  try {
    let ctx = await launch();
    let page = ctx.pages()[0] || (await ctx.newPage());
    await page.goto('/news/1');
    await waitForServiceWorker(page);
    await row(page, 'Second mocked story').getByRole('button', { name: 'Save story' }).click();
    await waitForCachedItem(page, 102);
    await ctx.close();

    ctx = await launch();
    page = ctx.pages()[0] || (await ctx.newPage());
    await page.goto('/saved');
    await expect(page.locator('.saved-story .title')).toHaveText(['Second mocked story']);

    // Simulate a service worker update/reset: unregister it and wipe its caches.
    await page.evaluate(async () => {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    });
    await page.reload();
    await expect(page.locator('.saved-story .title')).toHaveText(['Second mocked story']);
    await ctx.close();
  } finally {
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }
});
