import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { SettingsProvider } from '../context';
import { ROUTER_FUTURE_FLAGS } from '../routerConfig';

export function createTestQueryClient(): QueryClient {
    return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
}

export function LocationDisplay() {
    const location = useLocation();
    return <div data-testid="location">{location.pathname + location.search}</div>;
}

export function renderWithProviders(
    ui: ReactElement,
    { route = '/', queryClient = createTestQueryClient() }: { route?: string; queryClient?: QueryClient } = {}
): RenderResult {
    return render(
        <QueryClientProvider client={queryClient}>
            <SettingsProvider>
                <MemoryRouter initialEntries={[route]} future={ROUTER_FUTURE_FLAGS}>
                    {ui}
                    <LocationDisplay />
                </MemoryRouter>
            </SettingsProvider>
        </QueryClientProvider>
    );
}
