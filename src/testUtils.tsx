import { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { vi } from 'vitest';

import { SettingsProvider } from './context/SettingsContext';

export function stubMatchMedia(matches = false) {
    vi.stubGlobal(
        'matchMedia',
        vi.fn(() => ({
            matches,
            media: '(prefers-color-scheme: dark)',
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        }))
    );
}

export interface RenderOptions {
    path?: string;
    route?: string;
}

export function renderWithProviders(element: ReactElement, { path = '*', route = '/' }: RenderOptions = {}) {
    const router = createMemoryRouter([{ path, element }], { initialEntries: [route] });

    return {
        router,
        ...render(
            <SettingsProvider>
                <RouterProvider router={router} />
            </SettingsProvider>
        ),
    };
}
