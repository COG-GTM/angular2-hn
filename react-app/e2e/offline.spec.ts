/// <reference lib="dom" />
import { expect, test, type BrowserContext, type Page } from '@playwright/test';

const story = {
    id: 8863,
    title: 'My YC app: Dropbox - Throw away your USB drive',
    points: 104,
    user: 'dhouston',
    time: 1175714200,
    time_ago: '15 years ago',
    comments_count: 71,
    type: 'link',
    url: 'http://www.getdropbox.com/u/2/screencast.html',
    domain: 'getdropbox.com',
};
const FEED_URL = 'https://node-hnapi.herokuapp.com/news?page=1';
const ITEM_URL = 'https://node-hnapi.herokuapp.com/item/8863';

test.use({ serviceWorkers: 'allow' });

// Slow enough that the first feed request is still in flight when the SW takes control.
const API_LATENCY_MS = 1500;

async function mockApi(context: BrowserContext) {
    await context.route('https://node-hnapi.herokuapp.com/**', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, API_LATENCY_MS));
        const { pathname } = new URL(route.request().url());
        const body = pathname.startsWith('/item/') ? { ...story, comments: [], content: '' } : [story];
        return route.fulfill({ json: body, headers: { 'access-control-allow-origin': '*' } });
    });
}

async function waitForServiceWorkerControl(page: Page) {
    await page.evaluate(async () => {
        await navigator.serviceWorker.ready;
        if (!navigator.serviceWorker.controller) {
            await new Promise((resolve) =>
                navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true })
            );
        }
    });
}

// setOffline doesn't cover the SW's own fetches and route mocks keep answering while offline,
// so swap the mocks for a route that fails every request (SW fetches included).
async function goOffline(context: BrowserContext) {
    await context.unrouteAll();
    await context.route('**/*', (route) => route.abort('internetdisconnected'));
    await context.setOffline(true);
}

function isCached(page: Page, cacheName: string, url: string) {
    return page.evaluate(async ([name, u]) => !!(await (await caches.open(name)).match(u)), [cacheName, url] as const);
}

function fetchJson(page: Page, url: string) {
    return page.evaluate(async (u) => (await fetch(u)).json(), url);
}

test('app shell, deep links and visited API responses work offline', async ({ context, page }) => {
    await mockApi(context);

    await page.goto('/news/1');
    await expect(page.locator('#root .main-content')).toBeVisible();
    await expect(page.getByText(story.title).first()).toBeVisible();
    await waitForServiceWorkerControl(page);

    // First visit: the feed request started before the SW took control, so registerSW re-requests it.
    await expect.poll(() => isCached(page, 'hn-api', FEED_URL)).toBe(true);
    // Item details render a placeholder for now, so request the item through the SW directly.
    expect(await fetchJson(page, ITEM_URL)).toMatchObject({ id: story.id });

    await goOffline(context);

    const reload = await page.reload();
    expect(reload?.fromServiceWorker()).toBe(true);
    await expect(page.locator('#root .main-content')).toBeVisible();
    // The feed renders from the SW's runtime cache.
    await expect(page.getByText(story.title).first()).toBeVisible();
    await expect(page).toHaveTitle('Angular 2 HN');
    expect(await fetchJson(page, FEED_URL)).toEqual([story]);

    // Deep link that was never loaded as a document: served by navigateFallback, lazy chunk from precache.
    const deepLink = await page.goto('/item/8863');
    expect(deepLink?.fromServiceWorker()).toBe(true);
    await expect(page).toHaveURL(/\/item\/8863$/);
    await expect(page.locator('#root .main-content')).toBeVisible();
    expect(await fetchJson(page, ITEM_URL)).toMatchObject({ id: story.id, title: story.title });

    // Pages never visited online have no cached API data.
    await expect(fetchJson(page, 'https://node-hnapi.herokuapp.com/item/1')).rejects.toThrow();
});

test('serves a valid web app manifest', async ({ page }) => {
    await page.goto('/news/1');
    const href = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(href).toBe('/manifest.webmanifest');
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#b92b27');

    const manifest = await (await page.request.get(href!)).json();
    expect(manifest).toMatchObject({
        name: 'Angular 2 HN',
        short_name: 'Angular 2 HN',
        theme_color: '#b92b27',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './?utm_source=web_app_manifest',
    });
    expect(manifest.icons.map((icon: { sizes: string }) => icon.sizes)).toEqual([
        '144x144',
        '192x192',
        '256x256',
        '512x512',
    ]);
    for (const icon of manifest.icons) {
        expect((await page.request.get(icon.src)).ok()).toBe(true);
    }
});
