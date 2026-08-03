import { expect, test } from '@playwright/test';

test.describe('progressive web app', () => {
    test('serves the web app manifest', async ({ request }) => {
        const response = await request.get('/manifest.json');

        expect(response.ok()).toBe(true);
        expect(await response.json()).toMatchObject({ display: 'standalone', start_url: expect.any(String) });
    });

    test('ships a service worker that precaches the app shell', async ({ request }) => {
        const response = await request.get('/sw.js');

        expect(response.ok()).toBe(true);

        const source = await response.text();

        expect(source).toContain('precacheAndRoute');
        expect(source).toContain('index.html');
    });

    test('registers the service worker in the browser', async ({ browser }) => {
        const context = await browser.newContext({ serviceWorkers: 'allow' });
        const page = await context.newPage();

        await page.goto('/news/1');
        const registered = await page.evaluate(() =>
            navigator.serviceWorker.ready.then((registration) => Boolean(registration.active))
        );

        expect(registered).toBe(true);
        await context.close();
    });
});
