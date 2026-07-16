import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SettingsProvider } from '../context/SettingsContext';

interface ProviderOptions extends Omit<RenderOptions, 'wrapper'> {
    route?: string;
    seedStorage?: Record<string, string>;
}

export function renderWithProviders(ui: ReactElement, { route = '/', seedStorage, ...options }: ProviderOptions = {}) {
    if (seedStorage) {
        Object.entries(seedStorage).forEach(([key, value]) => localStorage.setItem(key, value));
    }

    const Wrapper = ({ children }: { children: ReactNode }) => (
        <MemoryRouter initialEntries={[route]}>
            <SettingsProvider>{children}</SettingsProvider>
        </MemoryRouter>
    );

    return render(ui, { wrapper: Wrapper, ...options });
}
