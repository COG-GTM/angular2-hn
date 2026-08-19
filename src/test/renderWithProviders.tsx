import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { SettingsProvider } from '../context/SettingsContext';

interface ProviderOptions extends Omit<RenderOptions, 'wrapper'> {
    initialEntries?: string[];
    /** Render the element under this route path so `useParams` resolves. */
    routePath?: string;
}

export function renderWithProviders(ui: ReactElement, options: ProviderOptions = {}): RenderResult {
    const { initialEntries = ['/'], routePath, ...renderOptions } = options;

    function Wrapper({ children }: { children: ReactNode }) {
        return (
            <MemoryRouter initialEntries={initialEntries}>
                <SettingsProvider>
                    {routePath ? (
                        <Routes>
                            <Route path={routePath} element={children} />
                        </Routes>
                    ) : (
                        children
                    )}
                </SettingsProvider>
            </MemoryRouter>
        );
    }

    return render(ui, { wrapper: Wrapper, ...renderOptions });
}

export * from '@testing-library/react';
