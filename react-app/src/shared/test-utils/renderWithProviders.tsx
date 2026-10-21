import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';

import { createQueryClient } from '../api';
import { SettingsProvider } from '../settings';

export interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
    /** Initial URL, e.g. `/item/123`. Default `/`. */
    route?: string;
    /** Route pattern `ui` is mounted on, e.g. `/item/:id`. Default `*`. */
    path?: string;
    /** Extra routes rendered next to `path` (e.g. link targets), as `{ [pattern]: element }`. */
    otherRoutes?: Record<string, ReactNode>;
    /** Supply your own client to inspect the cache. Default: `createTestQueryClient()`. */
    queryClient?: QueryClient;
}

export interface RenderWithProvidersResult extends RenderResult {
    queryClient: QueryClient;
    user: ReturnType<typeof userEvent.setup>;
}

/** App defaults, but no retries and no gc during the test. */
export function createTestQueryClient(): QueryClient {
    const client = createQueryClient();
    client.setDefaultOptions({
        queries: { ...client.getDefaultOptions().queries, retry: false, gcTime: Infinity },
    });
    return client;
}

/**
 * Renders `ui` inside QueryClientProvider + SettingsProvider + MemoryRouter at `route`, mounted on
 * `<Route path={path}>` so `useParams()` works. `rerender(next)` keeps providers, client and location.
 */
export function renderWithProviders(
    ui: ReactElement,
    {
        route = '/',
        path = '*',
        otherRoutes = {},
        queryClient = createTestQueryClient(),
        ...options
    }: RenderWithProvidersOptions = {}
): RenderWithProvidersResult {
    const user = userEvent.setup();
    const wrap = (element: ReactNode) => (
        <QueryClientProvider client={queryClient}>
            <SettingsProvider>
                <MemoryRouter initialEntries={[route]}>
                    <Routes>
                        <Route path={path} element={element} />
                        {Object.entries(otherRoutes).map(([pattern, el]) => (
                            <Route key={pattern} path={pattern} element={el} />
                        ))}
                    </Routes>
                </MemoryRouter>
            </SettingsProvider>
        </QueryClientProvider>
    );
    const result = render(wrap(ui), options);
    const rerender = (next: ReactNode) => result.rerender(wrap(next));
    return { ...result, rerender, queryClient, user };
}
