import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement, ReactNode } from 'react';

import { SettingsProvider } from './shared/services/settings-context';

interface ProviderOptions extends Omit<RenderOptions, 'wrapper'> {
    route?: string;
}

export function renderWithProviders(ui: ReactElement, { route = '/', ...options }: ProviderOptions = {}): RenderResult {
    function Providers({ children }: { children: ReactNode }) {
        return (
            <SettingsProvider>
                <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
            </SettingsProvider>
        );
    }

    return render(ui, { wrapper: Providers, ...options });
}
