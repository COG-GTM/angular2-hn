import { readFileSync } from 'node:fs';
import { test, expect, type Page } from '@playwright/test';

const item = JSON.parse(readFileSync(new URL('./fixtures/item.json', import.meta.url), 'utf8'));
const pageTwo = JSON.parse(readFileSync(new URL('./fixtures/page-two.json', import.meta.url), 'utf8')) as Record<string, unknown>[];
const user = JSON.parse(readFileSync(new URL('./fixtures/user.json', import.meta.url), 'utf8'));
const api = 'https://node-hnapi.herokuapp.com/**';

test.beforeEach(async ({ context }) => {
  await context.route('https://www.google-analytics.com/**', route => route.abort());
  await context.route(api, async route => {
    const url = new URL(route.request().url());
    if (url.pathname === '/user/alice') return route.fulfill({ json: user });
    if (url.pathname === '/item/123') return route.fulfill({ json: item });
    if (url.pathname === '/news') {
      const stories = url.searchParams.get('page') === '2'
        ? pageTwo.map(story => ({ ...item, ...story }))
        : Array.from({ length: 30 }, (_, index) => ({ ...item, id: 123 + index, title: index ? `Top story ${index + 1}` : item.title }));
      return route.fulfill({ json: stories });
    }
    return route.abort();
  });
});

async function expectShell(page: Page) {
  await expect(page.getByRole('banner')).toBeAttached();
  await expect(page.getByRole('img', { name: 'Logo', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'new', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Settings', exact: true })).toBeVisible();
}

test('feed loads, pages forward and returns with Prev', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/news\/1$/);
  await expect(page.getByRole('link', { name: item.title, exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'More' }).click();
  await expect(page).toHaveURL(/\/news\/2$/);
  await expect(page.getByRole('link', { name: 'Second page story', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: item.title, exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: 'Prev' }).click();
  await expect(page).toHaveURL(/\/news\/1$/);
  await expect(page.getByRole('link', { name: item.title, exact: true })).toBeVisible();
});

test('comments link opens item and nested comments can collapse', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('listitem').filter({ has: page.getByRole('link', { name: item.title, exact: true }) })
    .getByRole('link', { name: '2 comments' }).filter({ visible: true }).click();
  await expect(page).toHaveURL(/\/item\/123$/);
  await expect(page.getByRole('link', { name: item.title, exact: true }).filter({ visible: true })).toBeVisible();
  await expect(page.getByText('Parent comment', { exact: true })).toBeVisible();
  await expect(page.getByText('Nested comment', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Collapse comment by parent', exact: true }).click();
  await expect(page.getByText('Nested comment', { exact: true })).toBeHidden();
  await page.getByRole('button', { name: 'Expand comment by parent', exact: true }).click();
  await expect(page.getByText('Nested comment', { exact: true })).toBeVisible();
});

test('profile renders fields and sanitized about markup', async ({ page }) => {
  await page.goto('/user/alice');
  await expect(page.getByText('1234 ★', { exact: true })).toBeVisible();
  await expect(page.getByText('Created 10 years ago', { exact: true })).toBeVisible();
  await expect(page.locator('b').filter({ hasText: 'About Alice' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Website' })).toHaveAttribute('href', 'https://example.com/alice');
  await expect(page.locator('.other-details script, .other-details [onerror]')).toHaveCount(0);
  expect(await page.evaluate(() => Reflect.get(window, 'unsafeAbout'))).toBeUndefined();
});

test('AMOLED theme persists across reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('radio', { name: 'Black (AMOLED)', exact: true }).check();
  await expect(page.locator('#root > .amoledblack')).toBeVisible();
  await page.getByRole('button', { name: 'Close settings' }).click();
  await page.reload();
  await expect(page.locator('#root > .amoledblack')).toBeVisible();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.getByRole('radio', { name: 'Black (AMOLED)', exact: true })).toBeChecked();
});

test('service worker serves reload and uncached deep link offline without caching API data', async ({ page, context }, testInfo) => {
  const pageErrors: string[] = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('link', { name: item.title, exact: true })).toBeVisible();
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  if (!await page.evaluate(() => !!navigator.serviceWorker.controller)) await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await context.unroute(api);
  await context.setOffline(true);
  await page.reload();
  await expectShell(page);
  await expect(page.getByText('Could not load news stories.', { exact: true })).toBeVisible();
  await page.goto('/item/123');
  await expect(page).toHaveURL(/\/item\/123$/);
  await expectShell(page);
  await expect(page.getByText('Could not load item comments.', { exact: true })).toBeVisible();
  expect(pageErrors).toEqual([]);
  await testInfo.attach('offline-shell', { body: await page.screenshot(), contentType: 'image/png' });
});
