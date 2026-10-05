import { expect, test } from './fixtures';

test.describe('app shell', () => {
  test('redirects / to /news/1', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(page.getByTestId('theme-root')).toBeVisible();
  });

  for (const feedType of ['news', 'newest', 'show', 'ask', 'jobs']) {
    test(`serves /${feedType}/1 (deep link)`, async ({ page }) => {
      await page.goto(`/${feedType}/1`);
      await expect(page).toHaveURL(new RegExp(`/${feedType}/1$`));
      await expect(page.getByTestId('theme-root')).toBeVisible();
    });
  }

  test('serves /item/:id and /user/:id deep links', async ({ page }) => {
    await page.goto('/item/42');
    await expect(page).toHaveURL(/\/item\/42$/);
    await page.goto('/user/pg');
    await expect(page).toHaveURL(/\/user\/pg$/);
  });

  test('applies the saved theme', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'night'));
    await page.goto('/news/1');
    await expect(page.getByTestId('theme-root')).toHaveClass(/\bnight\b/);
  });

  test('follows the system dark colour scheme on first visit', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/news/1');
    await expect(page.getByTestId('theme-root')).toHaveClass(/\bnight\b/);
  });
});

test.describe('PWA', () => {
  test('serves a web app manifest', async ({ page, request }) => {
    await page.goto('/news/1');
    const href = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(href).toBeTruthy();
    const manifest = await (await request.get(href!)).json();
    expect(manifest).toMatchObject({ short_name: 'Angular 2 HN', display: 'standalone', theme_color: '#b92b27' });
  });

  test('registers a service worker that serves the app shell offline', async ({ page, context }) => {
    await page.goto('/news/1');
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload();
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);

    await context.setOffline(true);
    await page.goto('/newest/1');
    await expect(page.getByTestId('theme-root')).toBeVisible();
    await context.setOffline(false);
  });
});
