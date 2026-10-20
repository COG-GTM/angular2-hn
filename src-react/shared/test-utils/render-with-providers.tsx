import type { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { createQueryClient } from '../api';
import { SettingsProvider } from '../settings';
import { ROUTER_FUTURE_FLAGS } from '../utils';

export interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
    /** Initial URL, e.g. `/item/123`. Default `/`. */
    route?: string;
    /** Route pattern the UI is mounted on, e.g. `/item/:id`. Default `*`. */
    path?: string;
    /** Supply your own client to inspect the cache. Default: fresh client with `retry: false`. */
    queryClient?: QueryClient;
}

export interface RenderWithProvidersResult extends RenderResult {
    queryClient: QueryClient;
    user: ReturnType<typeof userEvent.setup>;
}

export function createTestQueryClient(): QueryClient {
    const client = createQueryClient();
    client.setDefaultOptions({
        queries: { ...client.getDefaultOptions().queries, retry: false, staleTime: 0, gcTime: Infinity },
    });
    return client;
}

/**
 * Renders `ui` inside QueryClientProvider + SettingsProvider + MemoryRouter/Routes at `route`.
 * `rerender(newUi)` keeps the same providers, client and current location.
 */
export function renderWithProviders(
    ui: ReactElement,
    { route = '/', path = '*', queryClient = createTestQueryClient(), ...options }: RenderWithProvidersOptions = {}
): RenderWithProvidersResult {
    const user = userEvent.setup();
    const wrap = (element: ReactNode) => (
        <QueryClientProvider client={queryClient}>
            <SettingsProvider>
                <MemoryRouter initialEntries={[route]} future={ROUTER_FUTURE_FLAGS}>
                    <Routes>
                        <Route path={path} element={element} />
                    </Routes>
                </MemoryRouter>
            </SettingsProvider>
        </QueryClientProvider>
    );
    const result = render(wrap(ui), options);
    const rerender = (next: ReactNode) => result.rerender(wrap(next));
    return { ...result, rerender, queryClient, user };
}
