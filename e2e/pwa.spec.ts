import { expect, test } from '@playwright/test';
import { mockApi } from './mockApi';

test.use({ serviceWorkers: 'allow' });

test('registers a service worker and exposes the web app manifest', async ({ page, baseURL }) => {
    await mockApi(page);
    await page.goto('/news/1');

    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/manifest.json');

    const manifest = await page.request.get(`${baseURL}/manifest.json`);
    expect(manifest.ok()).toBeTruthy();
    expect((await manifest.json()).short_name).toBe('React HN');

    const serviceWorker = await page.request.get(`${baseURL}/sw.js`);
    expect(serviceWorker.ok()).toBeTruthy();

    await expect
        .poll(() => page.evaluate(() => navigator.serviceWorker.getRegistrations().then((r) => r.length)), {
            timeout: 15_000,
        })
        .toBeGreaterThan(0);
});
