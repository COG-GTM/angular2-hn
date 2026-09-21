import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { SettingsProvider } from '../context/SettingsProvider';

export function renderWithProviders(
    ui: ReactElement,
    { route = '/', ...options }: RenderOptions & { route?: string } = {}
) {
    function Wrapper({ children }: { children: ReactNode }) {
        return (
            <SettingsProvider>
                <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
            </SettingsProvider>
        );
    }

    return render(ui, { wrapper: Wrapper, ...options });
}

export function mockMatchMedia(matches: boolean) {
    const listeners = new Set<(event: MediaQueryListEvent) => void>();
    const media: MediaQueryList = {
        matches,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addEventListener: (_: string, listener: EventListener) =>
            listeners.add(listener as (event: MediaQueryListEvent) => void),
        removeEventListener: (_: string, listener: EventListener) =>
            listeners.delete(listener as (event: MediaQueryListEvent) => void),
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
    } as unknown as MediaQueryList;

    window.matchMedia = (() => media) as unknown as typeof window.matchMedia;

    return {
        media,
        emit(nextMatches: boolean) {
            listeners.forEach((listener) => listener({ matches: nextMatches } as MediaQueryListEvent));
        },
        listenerCount: () => listeners.size,
    };
}
