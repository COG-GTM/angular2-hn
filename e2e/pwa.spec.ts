/// <reference lib="dom" />
import { expect, test } from '@playwright/test';

import { mockHnApi } from './fixtures';
import { waitForServiceWorkerControl } from './sw-helpers';

test.use({ serviceWorkers: 'allow' });

test.beforeEach(async ({ context }) => {
    await mockHnApi(context);
});

test('serves the manifest ported from Angular src/manifest.json', async ({ page, request }) => {
    const response = await request.get('/manifest.webmanifest');
    expect(response.ok()).toBe(true);
    const manifest = await response.json();
    expect(manifest).toEqual({
        name: 'Angular 2 HN',
        short_name: 'Angular 2 HN',
        icons: [144, 192, 256, 512].map((size) => ({
            src: `assets/icons/android-chrome-${size}x${size}.png`,
            sizes: `${size}x${size}`,
            type: 'image/png',
        })),
        theme_color: '#b92b27',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './?utm_source=web_app_manifest',
    });
    for (const icon of manifest.icons) {
        const iconResponse = await request.get(`/${icon.src}`);
        expect(iconResponse.ok(), icon.src).toBe(true);
        expect(iconResponse.headers()['content-type']).toContain('image/png');
    }
    await page.goto('/');
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/manifest.webmanifest');
});

test('registers an active service worker and is installable', async ({ page }) => {
    await page.goto('/news/1');
    await waitForServiceWorkerControl(page);
    expect(await page.evaluate(() => navigator.serviceWorker.controller?.scriptURL)).toMatch(/\/sw\.js$/);

    // Playwright contexts are incognito, which Chrome always reports; every other check must pass.
    const cdp = await page.context().newCDPSession(page);
    const installabilityErrors = async () =>
        (await cdp.send('Page.getInstallabilityErrors')).installabilityErrors
            .map(({ errorId }) => errorId)
            .filter((errorId) => errorId !== 'in-incognito');
    await expect.poll(installabilityErrors, { timeout: 10_000 }).toEqual([]);
    const { url, errors } = await cdp.send('Page.getAppManifest');
    expect(url).toMatch(/\/manifest\.webmanifest$/);
    expect(errors).toEqual([]);
});

test('/ngsw-worker.js is the safety worker, not the SPA fallback', async ({ request }) => {
    const response = await request.get('/ngsw-worker.js');
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toContain('javascript');
    const body = await response.text();
    expect(body).toContain("key.startsWith('ngsw:')");
    expect(body).toContain('registration.unregister()');
    expect(body).not.toContain('<html');
});

test('ngsw-worker.js retires a previously installed Angular service worker', async ({ page }) => {
    await page.goto('/news/1');
    await waitForServiceWorkerControl(page);

    // Returning Angular visitor: ngsw caches plus the registration's script switching to /ngsw-worker.js
    // (what the browser's update check does). The safety worker cleans up and reloads the tab.
    const reloaded = page.waitForEvent('load');
    await page.evaluate(async () => {
        await (await caches.open('ngsw:/:db:control')).put('/x', new Response('x'));
        void navigator.serviceWorker.register('/ngsw-worker.js');
    });
    await reloaded;

    await expect
        .poll(() => page.evaluate(async () => (await caches.keys()).filter((key) => key.startsWith('ngsw:'))))
        .toEqual([]);
    // The reloaded React page registers its own SW again.
    await expect
        .poll(() =>
            page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.active?.scriptURL ?? '')
        )
        .toMatch(/\/sw\.js$/);
    await expect(page.getByTestId('feed-list')).toBeVisible();
});
