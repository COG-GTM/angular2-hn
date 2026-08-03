import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement, ReactNode } from 'react';

import { SettingsProvider } from '../context/SettingsContext';

interface Options extends Omit<RenderOptions, 'wrapper'> {
    route?: string;
}

/** Renders a component inside the providers the app always mounts it under. */
export function renderWithProviders(ui: ReactElement, { route = '/', ...options }: Options = {}): RenderResult {
    function Wrapper({ children }: { children: ReactNode }) {
        return (
            <SettingsProvider>
                <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
            </SettingsProvider>
        );
    }

    return render(ui, { wrapper: Wrapper, ...options });
}
