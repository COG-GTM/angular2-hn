import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { SettingsProvider } from '../context/SettingsContext';

export interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
    /** Initial URL, e.g. `/item/123`. Default `/`. */
    route?: string;
    /** Route pattern `ui` is mounted on, e.g. `/item/:id`. Default `*`. */
    path?: string;
    /** Extra routes next to `path` (e.g. link targets), as `{ [pattern]: element }`. */
    otherRoutes?: Record<string, ReactNode>;
}

/** Renders `ui` inside SettingsProvider + MemoryRouter at `route`, mounted on `<Route path={path}>`. */
export function renderWithProviders(
    ui: ReactElement,
    { route = '/', path = '*', otherRoutes = {}, ...options }: RenderWithProvidersOptions = {}
): RenderResult & { user: ReturnType<typeof userEvent.setup> } {
    const user = userEvent.setup();
    const result = render(
        <SettingsProvider>
            <MemoryRouter initialEntries={[route]}>
                <Routes>
                    <Route path={path} element={ui} />
                    {Object.entries(otherRoutes).map(([pattern, element]) => (
                        <Route key={pattern} path={pattern} element={element} />
                    ))}
                </Routes>
            </MemoryRouter>
        </SettingsProvider>,
        options
    );
    return { ...result, user };
}
