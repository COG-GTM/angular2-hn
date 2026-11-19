import { expect, test } from '../fixtures';

// The production build must ship a working Angular service worker.
test.describe('PWA', () => {
    test.use({ serviceWorkers: 'allow' });

    test('serves the web app manifest', async ({ page, request }) => {
        await page.goto('/news/1');
        const href = await page.locator('link[rel="manifest"]').first().getAttribute('href');
        const response = await request.get(new URL(href!, page.url()).toString());
        expect(response.ok()).toBe(true);
        const manifest = await response.json();
        expect(manifest).toMatchObject({ name: 'Angular 2 HN', display: 'standalone', theme_color: '#b92b27' });
        expect(manifest.icons.length).toBeGreaterThan(0);
    });

    test('ships ngsw.json built from ngsw-config.json', async ({ request }) => {
        const response = await request.get('/ngsw.json');
        expect(response.ok()).toBe(true);
        const ngsw = await response.json();
        expect(ngsw.index).toBe('/index.html');
        expect(ngsw.assetGroups.map((g: { name: string }) => g.name)).toEqual(['app', 'assets']);
        const app = ngsw.assetGroups[0];
        expect(app.installMode).toBe('prefetch');
        expect(app.urls).toContain('/index.html');
        expect(app.urls.some((url: string) => url.endsWith('.js'))).toBe(true);
    });

    test('registers ngsw-worker.js and loads the app shell offline', async ({ page, context }) => {
        await page.goto('/news/1');
        const scriptURL = await page.evaluate(async () => (await navigator.serviceWorker.ready).active!.scriptURL);
        expect(new URL(scriptURL).pathname).toBe('/ngsw-worker.js');

        // Controlled once the worker has claimed the page; reload to be sure.
        await page.reload();
        await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);

        await context.setOffline(true);
        await page.goto('/news/1');
        expect(await page.evaluate(() => navigator.onLine)).toBe(false);
        await expect(page).toHaveTitle('Angular 2 HN');
        await expect(page.locator('app-root > *').first()).toBeAttached();
        await context.setOffline(false);
    });
});
