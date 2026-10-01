import { vi } from 'vitest';

export type RouteHandler = unknown | ((url: string) => unknown);

export interface MockRoute {
  status?: number;
  body: RouteHandler;
}

/**
 * Stubs global `fetch`, resolving each request URL against `routes` (exact
 * match). Unmatched URLs reject so tests fail loudly.
 */
export function mockFetch(routes: Record<string, MockRoute | unknown>) {
  const fn = vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (!(url in routes)) {
      throw new TypeError(`Unmocked fetch: ${url}`);
    }
    const entry = routes[url];
    const route: MockRoute =
      entry && typeof entry === 'object' && 'body' in entry ? (entry as MockRoute) : { body: entry };
    const body = typeof route.body === 'function' ? (route.body as (u: string) => unknown)(url) : route.body;
    return new Response(JSON.stringify(body), {
      status: route.status ?? 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}
