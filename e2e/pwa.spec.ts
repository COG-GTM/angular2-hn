import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { stubHackerNewsApi } from './fixtures/hnApi';

const distDir = fileURLToPath(new URL('../dist/', import.meta.url));

test.use({ serviceWorkers: 'allow' });

test('the production build emits the PWA assets', async () => {
    expect(existsSync(`${distDir}manifest.webmanifest`)).toBe(true);
    expect(existsSync(`${distDir}sw.js`)).toBe(true);
});

test('the service worker registers and the app renders offline', async ({ page, context }) => {
    await stubHackerNewsApi(page);
    await page.goto('/news/1');

    await expect(page.locator('li.post')).toHaveCount(30);
    const serviceWorkerSource = await (await page.request.get('/sw.js')).text();
    const precacheEntryCount = new Set(
        Array.from(serviceWorkerSource.matchAll(/url:"([^"]+)"/g), (match) => match[1])
    ).size;
    expect(precacheEntryCount).toBeGreaterThan(0);

    // the whole precache manifest has to be stored before the app can work offline
    await page.waitForFunction(
        async (expectedEntries) => {
            const registration = await navigator.serviceWorker.getRegistration();
            if (!registration?.active || !navigator.serviceWorker.controller) {
                return false;
            }
            const precacheName = (await caches.keys()).find((name) => name.startsWith('workbox-precache'));
            if (!precacheName) {
                return false;
            }
            const entries = await (await caches.open(precacheName)).keys();
            return entries.length >= expectedEntries;
        },
        precacheEntryCount,
        { polling: 250 }
    );

    // navigate again while online until the document itself is served by the service
    // worker (a non-zero workerStart timing), which is what makes the app offline ready
    await expect
        .poll(
            async () => {
                await page.goto('/news/1');
                return page.evaluate(() => {
                    const [navigation] = performance.getEntriesByType(
                        'navigation'
                    ) as PerformanceNavigationTiming[];
                    return navigation ? navigation.workerStart : 0;
                });
            },
            { timeout: 20000 }
        )
        .toBeGreaterThan(0);

    await context.setOffline(true);
    await page.reload();

    await expect(page.getByAltText('Logo')).toBeVisible();
    await expect(page.getByRole('link', { name: 'ask', exact: true })).toBeVisible();
    // the API request is made by the service worker, which cannot reach the network,
    // so the shell renders from the precache and the feed reports the failure
    await expect(page.getByText('Could not load news stories.')).toBeVisible();

    await context.setOffline(false);
});
