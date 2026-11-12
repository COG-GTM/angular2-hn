import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { SettingsProvider } from '../shared/settings/SettingsProvider';

export function renderWithProviders(ui: ReactElement, { route = '/' }: { route?: string } = {}) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[route]}>
                <SettingsProvider>{ui}</SettingsProvider>
            </MemoryRouter>
        </QueryClientProvider>
    );
}

export function mockFetch(handler: (url: string) => unknown) {
    return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
        const body = handler(url);
        if (body instanceof Error) {
            return new Response('error', { status: 500 });
        }
        return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
    });
}
