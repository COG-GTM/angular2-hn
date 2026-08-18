import { render, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement } from 'react';
import { SettingsProvider } from '../context/SettingsContext';

interface Options {
    route?: string;
}

export function renderWithProviders(ui: ReactElement, { route = '/' }: Options = {}): RenderResult {
    return render(
        <MemoryRouter initialEntries={[route]}>
            <SettingsProvider>{ui}</SettingsProvider>
        </MemoryRouter>
    );
}
