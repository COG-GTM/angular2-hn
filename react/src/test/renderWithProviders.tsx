import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { vi } from 'vitest';
import { SettingsProvider } from '../shared/services/SettingsProvider';

export function stubMatchMedia(matches = false) {
    vi.stubGlobal('matchMedia', (query: string) => ({
        matches,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
    }));
}

export function LocationProbe() {
    const location = useLocation();
    return <div data-testid="location">{location.pathname + location.search}</div>;
}

export function renderWithProviders(ui: ReactElement, { route = '/' }: { route?: string } = {}) {
    stubMatchMedia();
    return render(
        <MemoryRouter initialEntries={[route]}>
            <SettingsProvider>
                {ui}
                <LocationProbe />
            </SettingsProvider>
        </MemoryRouter>
    );
}
