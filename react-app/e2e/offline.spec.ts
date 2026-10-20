/// <reference lib="dom" />
import { expect, test } from '@playwright/test';

import { item, mockHnApi, story, urls, user } from './fixtures';
import { fetchJson, goOffline, isCached, waitForServiceWorkerControl } from './sw-helpers';

test.use({ serviceWorkers: 'allow' });

// Slow enough that the first feed request is still in flight when the new SW takes control.
const API_LATENCY_MS = 1500;
const FEED_URL = urls.feed('news', 1);

test('app shell, deep links and visited API responses work offline', async ({ context, page }) => {
    await mockHnApi(context, { latencyMs: API_LATENCY_MS });
    // Stand-in for FeedList until the feature lands: request the feed as the page boots, i.e. before the SW
    // controls it, which is exactly the first-visit case registerSW's cache warm-up handles.
    await page.addInitScript((url) => {
        if (location.pathname === '/news/1' && !navigator.serviceWorker.controller) void fetch(url);
    }, FEED_URL);

    await page.goto('/news/1');
    await expect(page.getByTestId('feed-list')).toBeVisible();
    await waitForServiceWorkerControl(page);

    await expect.poll(() => isCached(page, 'hn-api', FEED_URL), { timeout: 15_000 }).toBe(true);
    // Requests made while controlled go through the SW's NetworkFirst routes and are cached.
    await fetchJson(page, urls.item(item.id));
    await fetchJson(page, urls.user(user.id));
    expect(await isCached(page, 'hn-api', urls.item(item.id))).toBe(true);
    expect(await isCached(page, 'hnpwa-api', urls.user(user.id))).toBe(true);

    await goOffline(context);

    const reload = await page.reload();
    expect(reload?.fromServiceWorker()).toBe(true);
    await expect(page).toHaveTitle('Angular 2 HN');
    await expect(page.getByTestId('header')).toBeVisible();
    await expect(page.getByTestId('feed-list')).toBeVisible();
    // App-shell images are precached.
    await expect(page.locator('.app-loader img.logo')).toHaveJSProperty('complete', true);
    expect(await page.evaluate(async () => (await fetch('/assets/images/cog.svg')).ok)).toBe(true);
    // Visited API data comes from the runtime cache.
    expect((await fetchJson(page, FEED_URL))[0]).toMatchObject({ id: story.id, title: story.title });

    // Deep links never loaded as documents: navigateFallback + precached lazy chunks.
    const itemPage = await page.goto(`/item/${item.id}`);
    expect(itemPage?.fromServiceWorker()).toBe(true);
    await expect(page.getByTestId('item-details')).toBeVisible();
    expect(await fetchJson(page, urls.item(item.id))).toMatchObject({ id: item.id, title: item.title });

    const userPage = await page.goto(`/user/${user.id}`);
    expect(userPage?.fromServiceWorker()).toBe(true);
    await expect(page.getByTestId('user-profile')).toBeVisible();
    expect(await fetchJson(page, urls.user(user.id))).toMatchObject({ id: user.id, karma: user.karma });
    // Route params that look like file names still get the shell (only static files are denylisted).
    const dottedUserPage = await page.goto('/user/john.json');
    expect(dottedUserPage?.fromServiceWorker()).toBe(true);
    await expect(page.getByTestId('user-profile')).toBeVisible();

    // Negative controls: API data never fetched online is not available, and static files are not
    // answered with the SPA fallback.
    await expect(fetchJson(page, urls.item(1))).rejects.toThrow();
    await expect(fetchJson(page, urls.feed('show', 2))).rejects.toThrow();
    await expect(page.goto('/missing-file.png')).rejects.toThrow();
});

// TODO(MBA-3267 integration wave): remove test.fixme once FeedList/ItemDetails are merged.
test.fixme('visited feed and item render offline from the cache (real components)', async ({ context, page }) => {
    await mockHnApi(context, { latencyMs: API_LATENCY_MS });
    await page.goto('/news/1');
    await expect(page.getByRole('link', { name: story.title }).filter({ visible: true }).first()).toBeVisible();
    await waitForServiceWorkerControl(page);
    await expect.poll(() => isCached(page, 'hn-api', FEED_URL), { timeout: 15_000 }).toBe(true);
    await page.getByRole('link', { name: '1 comment' }).filter({ visible: true }).first().click();
    await expect(page.locator('.comment-list')).toContainText('Fixture comment body');
    await page.goBack();

    await goOffline(context);
    await page.reload();
    await expect(page.locator('.post').first()).toBeVisible();
    await page.goto(`/item/${item.id}`);
    await expect(page.locator('.comment-list')).toContainText('Fixture comment body');

    // Uncached route: the shell renders but the data request fails → Angular's error message.
    await page.goto('/show/2');
    await expect(page.getByRole('alert')).toContainText('Could not load show stories.');
});
