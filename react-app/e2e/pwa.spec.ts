import { expect, test } from '@playwright/test';
import { FEED_TITLES, mockHnApi } from './mockApi';

test.use({ serviceWorkers: 'allow' });

test('manifest is linked and installable fields are present', async ({ page, request }) => {
  await page.goto('/news/1');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(href).toBeTruthy();
  const manifest = await (await request.get(href!)).json();
  expect(manifest).toMatchObject({ name: 'React HN', display: 'standalone', theme_color: '#b92b27' });
  expect(manifest.icons.map((i: { sizes: string }) => i.sizes)).toContain('512x512');
});

test('works offline after a single first visit (precached shell + cached API)', async ({ context, page }) => {
  await mockHnApi(context);
  await page.goto('/news/1');
  await expect(page.getByRole('link', { name: FEED_TITLES.news(1), exact: true })).toBeVisible();
  // No reload: the feed request made before the worker took control must still end up cached.
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const keys = await (await caches.open('hn-api')).keys();
        return keys.some((req) => req.url.includes('/news?page=1'));
      })
    )
    .toBe(true);

  await context.setOffline(true);
  await page.goto('/news/1');
  await expect(page.getByRole('button', { name: 'Settings' })).toBeVisible();
  await expect(page.getByRole('link', { name: FEED_TITLES.news(1), exact: true })).toBeVisible();
});
