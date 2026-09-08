import { act, render, renderHook, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SettingsProvider, useSettings } from './SettingsContext';

type ChangeListener = (event: MediaQueryListEvent) => void;

function stubMatchMedia(matches: boolean) {
    const listeners = new Set<ChangeListener>();
    const media: MediaQueryList = {
        matches,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addEventListener: (_: string, listener: ChangeListener) => listeners.add(listener),
        removeEventListener: (_: string, listener: ChangeListener) => listeners.delete(listener),
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => true,
    } as unknown as MediaQueryList;

    vi.stubGlobal(
        'matchMedia',
        vi.fn(() => media)
    );

    return {
        listeners,
        emit(nextMatches: boolean) {
            const event = { matches: nextMatches } as MediaQueryListEvent;
            listeners.forEach((listener) => listener(event));
        },
    };
}

function wrapper({ children }: { children: ReactNode }) {
    return <SettingsProvider>{children}</SettingsProvider>;
}

afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
});

describe('useSettings', () => {
    it('throws when used outside the provider', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        expect(() => renderHook(() => useSettings())).toThrow(
            'useSettings must be used within a SettingsProvider'
        );
        consoleError.mockRestore();
    });
});

describe('SettingsProvider', () => {
    it('uses the Angular service defaults when localStorage is empty', () => {
        stubMatchMedia(false);

        const { result } = renderHook(() => useSettings(), { wrapper });

        expect(result.current.settings).toMatchObject({
            showSettings: false,
            openLinkInNewTab: false,
            titleFontSize: '16',
            listSpacing: '0',
            theme: 'default',
        });
    });

    it('reads saved values from localStorage', () => {
        stubMatchMedia(true);
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '10');
        localStorage.setItem('theme', 'dark');

        const { result } = renderHook(() => useSettings(), { wrapper });

        expect(result.current.settings).toMatchObject({
            openLinkInNewTab: true,
            titleFontSize: '20',
            listSpacing: '10',
            theme: 'dark',
        });
    });

    it('persists setter results to localStorage', () => {
        stubMatchMedia(false);

        const { result } = renderHook(() => useSettings(), { wrapper });

        act(() => result.current.toggleOpenLinksInNewTab());
        act(() => result.current.setFont('22'));
        act(() => result.current.setSpacing('5'));
        act(() => result.current.setTheme('black'));

        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
        expect(localStorage.getItem('titleFontSize')).toBe('22');
        expect(localStorage.getItem('listSpacing')).toBe('5');
        expect(localStorage.getItem('theme')).toBe('black');
        expect(result.current.settings).toMatchObject({
            openLinkInNewTab: true,
            titleFontSize: '22',
            listSpacing: '5',
            theme: 'black',
        });
    });

    it('does not persist showSettings', () => {
        stubMatchMedia(false);

        const { result } = renderHook(() => useSettings(), { wrapper });

        act(() => result.current.toggleSettings());

        expect(result.current.settings.showSettings).toBe(true);
        expect(localStorage.getItem('showSettings')).toBeNull();
    });

    it('applies the system dark preference when no theme is saved', () => {
        stubMatchMedia(true);

        const { result } = renderHook(() => useSettings(), { wrapper });

        expect(result.current.settings.theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');
    });

    it('keeps the saved theme even when the system prefers dark', () => {
        stubMatchMedia(true);
        localStorage.setItem('theme', 'default');

        const { result } = renderHook(() => useSettings(), { wrapper });

        expect(result.current.settings.theme).toBe('default');
    });

    it('reacts to prefers-color-scheme changes', () => {
        const media = stubMatchMedia(false);

        const { result } = renderHook(() => useSettings(), { wrapper });

        act(() => media.emit(true));
        expect(result.current.settings.theme).toBe('night');

        act(() => media.emit(false));
        expect(result.current.settings.theme).toBe('default');
    });

    it('removes the media listener on unmount', () => {
        const media = stubMatchMedia(false);

        const { unmount } = render(
            <SettingsProvider>
                <span>child</span>
            </SettingsProvider>
        );

        expect(screen.getByText('child')).toBeInTheDocument();
        expect(media.listeners.size).toBe(1);

        unmount();

        expect(media.listeners.size).toBe(0);
    });
});
