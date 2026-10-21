/// <reference lib="dom" />
import type { BrowserContext, Page } from '@playwright/test';

export async function waitForServiceWorkerControl(page: Page) {
    await page.evaluate(async () => {
        await navigator.serviceWorker.ready;
        if (!navigator.serviceWorker.controller) {
            await new Promise((resolve) =>
                navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true })
            );
        }
    });
}

/**
 * `context.setOffline` (like DevTools "Offline") does not stop the SW's own fetches and route mocks keep
 * answering, so drop the mocks and abort every request — SW fetches included — before going offline.
 */
export async function goOffline(context: BrowserContext) {
    await context.unrouteAll({ behavior: 'ignoreErrors' });
    await context.route('**/*', (route) => route.abort('internetdisconnected'));
    await context.setOffline(true);
}

export function isCached(page: Page, cacheName: string, url: string) {
    return page.evaluate(async ([name, u]) => !!(await (await caches.open(name)).match(u)), [cacheName, url] as const);
}

/** fetch() from the page, i.e. through the controlling service worker. */
export function fetchJson(page: Page, url: string) {
    return page.evaluate(async (u) => (await fetch(u)).json(), url);
}
