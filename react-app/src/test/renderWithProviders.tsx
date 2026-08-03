import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { SettingsProvider } from '../shared/settings/SettingsProvider';
import { createSettingsStore, type SettingsStore } from '../shared/settings/settings-store';

interface ProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
    route?: string;
    store?: SettingsStore;
}

export interface RenderWithProvidersResult extends RenderResult {
    store: SettingsStore;
}

export function renderWithProviders(ui: ReactElement, options: ProvidersOptions = {}): RenderWithProvidersResult {
    const { route = '/', store = createSettingsStore(), ...renderOptions } = options;

    const Wrapper = ({ children }: { children: ReactNode }) => (
        <SettingsProvider store={store}>
            <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </SettingsProvider>
    );

    return { ...render(ui, { wrapper: Wrapper, ...renderOptions }), store };
}
