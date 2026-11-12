import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

import { SettingsProvider } from '../shared/settings/SettingsProvider';

export function renderWithProviders(ui: ReactElement, { route = '/' }: { route?: string } = {}) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(
        <QueryClientProvider client={queryClient}>
            <SettingsProvider>
                <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
            </SettingsProvider>
        </QueryClientProvider>
    );
}
