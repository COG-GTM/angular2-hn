import type { Page, Route } from '@playwright/test';

export const HN_API_BASE = 'https://node-hnapi.herokuapp.com';

export type ApiHandler = (url: URL) => unknown | Promise<unknown>;

/**
 * Intercepts every request to the HN API so e2e runs are deterministic and offline-safe.
 * `handlers` maps a path prefix (e.g. '/news', '/item/', '/user/') to a function returning the JSON body.
 * Unmatched requests fail with 404 so missing fixtures surface loudly.
 */
export async function mockHnApi(page: Page, handlers: Record<string, ApiHandler>): Promise<void> {
    await page.route(`${HN_API_BASE}/**`, async (route: Route) => {
        const url = new URL(route.request().url());
        const prefix = Object.keys(handlers)
            .sort((a, b) => b.length - a.length)
            .find((p) => url.pathname.startsWith(p));
        if (!prefix) {
            await route.fulfill({ status: 404, json: { error: `No mock for ${url.pathname}` } });
            return;
        }
        await route.fulfill({ status: 200, json: await handlers[prefix](url) });
    });
}
