import { expect, test } from '@playwright/test';

test.use({ serviceWorkers: 'allow' });

test('serves a web app manifest', async ({ page, request }) => {
    await page.goto('/news/1');
    const href = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(href).toBe('/manifest.webmanifest');
    const manifest = await (await request.get(href!)).json();
    expect(manifest).toMatchObject({ name: 'React HN', display: 'standalone', theme_color: '#b92b27' });
    expect(manifest.icons).toHaveLength(4);
});

test('loads the app shell offline once the service worker is installed', async ({ page, context }) => {
    await page.route('https://node-hnapi.herokuapp.com/**', (route) => route.abort());
    await page.goto('/news/1');
    await page.evaluate(async () => {
        await navigator.serviceWorker.ready;
    });
    // Second visit is served through the active worker and warms the runtime asset cache.
    await page.reload();
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
    await expect(page.locator('#header img.logo')).toBeVisible();

    await context.setOffline(true);
    await page.goto('/show/2');
    await expect(page.locator('#header')).toBeVisible();
    await expect(page.locator('#header img.logo')).toHaveJSProperty('complete', true);
    await expect(page.getByTestId('feed')).toHaveAttribute('data-feed-type', 'show');
    await context.setOffline(false);
});
