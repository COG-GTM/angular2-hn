import type { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
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

/** Renders `ui` inside QueryClientProvider + SettingsProvider + MemoryRouter/Routes at `route`. */
export function renderWithProviders(
    ui: ReactElement,
    { route = '/', path = '*', queryClient = createTestQueryClient(), ...options }: RenderWithProvidersOptions = {}
): RenderWithProvidersResult {
    const user = userEvent.setup();
    const result = render(
        <QueryClientProvider client={queryClient}>
            <SettingsProvider>
                <MemoryRouter initialEntries={[route]} future={ROUTER_FUTURE_FLAGS}>
                    <Routes>
                        <Route path={path} element={ui} />
                    </Routes>
                </MemoryRouter>
            </SettingsProvider>
        </QueryClientProvider>,
        options
    );
    return { ...result, queryClient, user };
}
