import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { SettingsProvider } from '../settings/SettingsContext';

export function renderWithProviders(ui: ReactElement, { route = '/' }: { route?: string } = {}) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(
        <QueryClientProvider client={queryClient}>
            <SettingsProvider>
                <MemoryRouter initialEntries={[route]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    {ui}
                </MemoryRouter>
            </SettingsProvider>
        </QueryClientProvider>
    );
}
