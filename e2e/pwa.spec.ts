import { expect, test } from '@playwright/test';

test.use({ serviceWorkers: 'allow' });

test('precaches the app shell and reloads offline', async ({ page, context }) => {
    await context.route(/node-hnapi\.herokuapp\.com|api\.hnpwa\.com/, (route) => route.fulfill({ json: [] }));

    await page.goto('/news/1');
    await page.waitForFunction(async () => {
        await navigator.serviceWorker.ready;
        return !!navigator.serviceWorker.controller;
    });
    await expect
        .poll(() =>
            page.evaluate(async () => {
                const names = await caches.keys();
                const precache = names.find((name) => name.startsWith('workbox-precache'));
                if (!precache) {
                    return false;
                }
                const urls = (await (await caches.open(precache)).keys()).map((request) => request.url);
                return urls.some((url) => url.includes('index.html'));
            })
        )
        .toBe(true);

    await context.setOffline(true);
    await page.reload();
    await expect(page.getByRole('link', { name: 'new' })).toBeVisible();
});
