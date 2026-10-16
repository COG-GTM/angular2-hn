import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router';
import { vi } from 'vitest';

import { routes as appRoutes } from '../router';
import { SettingsProvider } from '../shared/context/SettingsProvider';
import type { Settings } from '../shared/models';

export function createTestQueryClient() {
    return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
}

export interface RenderOptions {
    route?: string;
    settings?: Partial<Settings>;
    queryClient?: QueryClient;
}

// Render the real route tree (layout + lazy routes) at `route`.
export function renderApp({ route = '/', settings, queryClient = createTestQueryClient() }: RenderOptions = {}) {
    return renderRoutes(appRoutes, { route, settings, queryClient });
}

export function renderRoutes(
    routes: RouteObject[],
    { route = '/', settings, queryClient = createTestQueryClient() }: RenderOptions = {}
) {
    const router = createMemoryRouter(routes, { initialEntries: [route] });
    const result = render(
        <QueryClientProvider client={queryClient}>
            <SettingsProvider initial={settings}>
                <RouterProvider router={router} />
            </SettingsProvider>
        </QueryClientProvider>
    );
    return { ...result, router, queryClient };
}

// Render a single component inside providers and a router at `path` (pattern) / `route` (URL).
export function renderWithProviders(
    ui: ReactElement,
    { path = '/', route = '/', settings, queryClient, handle }: RenderOptions & { path?: string; handle?: unknown } = {}
) {
    return renderRoutes([{ path, element: ui, handle }], { route, settings, queryClient });
}

type Responder = unknown | ((url: string) => unknown);

export interface MockResponseInit {
    status?: number;
    body: Responder;
}

// Stub global fetch. Keys are URL substrings; the first match wins. Unmatched URLs reject.
// A responder function's return value is JSON-stringified (strings are sent as-is, so you can send invalid JSON).
export function mockFetch(routes: Record<string, Responder | MockResponseInit>) {
    const fn = vi.fn(async (input: RequestInfo | URL) => {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
        const key = Object.keys(routes).find((k) => url.includes(k));
        if (key === undefined) {
            throw new TypeError(`Unmocked fetch: ${url}`);
        }
        const entry = routes[key];
        const init: MockResponseInit =
            typeof entry === 'object' && entry !== null && 'body' in entry
                ? (entry as MockResponseInit)
                : { body: entry };
        const body = typeof init.body === 'function' ? (init.body as (u: string) => unknown)(url) : init.body;
        return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
            status: init.status ?? 200,
            headers: { 'Content-Type': 'application/json' },
        });
    });
    vi.stubGlobal('fetch', fn);
    return fn;
}
