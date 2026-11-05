import { expect, test } from '@playwright/test';

test('registers the Angular service worker in production builds', async ({ page }) => {
  await page.goto('/');
  const scriptUrl = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    return registration.active?.scriptURL;
  });
  expect(scriptUrl).toMatch(/\/ngsw-worker\.js$/);

  const manifest = await page.request.get('/manifest.json');
  expect(manifest.ok()).toBe(true);
});
