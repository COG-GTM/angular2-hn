import { render, RenderResult } from '@testing-library/react';
import { ReactElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { SettingsProvider } from './context/SettingsContext';

export interface RenderOptions {
    route?: string;
    path?: string;
}

export function renderWithProviders(ui: ReactElement, { route = '/', path }: RenderOptions = {}): RenderResult {
    return render(
        <MemoryRouter initialEntries={[route]}>
            <SettingsProvider>
                {path ? (
                    <Routes>
                        <Route path={path} element={ui} />
                    </Routes>
                ) : (
                    ui
                )}
            </SettingsProvider>
        </MemoryRouter>
    );
}
