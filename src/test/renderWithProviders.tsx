import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SettingsProvider } from '../context/SettingsProvider';

interface Options extends Omit<RenderOptions, 'wrapper'> {
    route?: string;
    path?: string;
}

/** Renders a tree wrapped in the router and settings providers the app relies on. */
export function renderWithProviders(ui: ReactElement, { route = '/', path, ...options }: Options = {}): RenderResult {
    function Wrapper({ children }: { children: ReactNode }) {
        return (
            <MemoryRouter initialEntries={[route]}>
                <SettingsProvider>
                    {path ? <Routes>{<Route path={path} element={children} />}</Routes> : children}
                </SettingsProvider>
            </MemoryRouter>
        );
    }

    return render(ui, { wrapper: Wrapper, ...options });
}
