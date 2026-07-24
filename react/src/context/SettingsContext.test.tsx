// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';

import { SettingsProvider } from './SettingsContext';
import { useSettings } from './useSettings';

type ChangeListener = (event: MediaQueryListEvent) => void;

let changeListeners: ChangeListener[];
let matchMediaMatches: boolean;

function mockMatchMedia() {
    changeListeners = [];
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: matchMediaMatches,
        media: query,
        addEventListener: (_type: string, listener: ChangeListener) => {
            changeListeners.push(listener);
        },
        removeEventListener: (_type: string, listener: ChangeListener) => {
            changeListeners = changeListeners.filter((l) => l !== listener);
        },
    }));
}

const wrapper = ({ children }: { children: ReactNode }) => (
    <SettingsProvider>{children}</SettingsProvider>
);

describe('SettingsProvider / useSettings', () => {
    beforeEach(() => {
        localStorage.clear();
        matchMediaMatches = false;
        mockMatchMedia();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('uses default initial settings when localStorage is empty', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings).toEqual({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
    });

    it('reads initial values from localStorage', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('theme', 'day');
        localStorage.setItem('titleFontSize', '18');
        localStorage.setItem('listSpacing', '8');
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings).toEqual({
            showSettings: false,
            openLinkInNewTab: true,
            theme: 'day',
            titleFontSize: '18',
            listSpacing: '8',
        });
    });

    it('derives night theme from dark color scheme without persisting', () => {
        matchMediaMatches = true;
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings.theme).toBe('night');
        expect(localStorage.getItem('theme')).toBeNull();
    });

    it('prefers saved theme over system color scheme', () => {
        matchMediaMatches = true;
        localStorage.setItem('theme', 'default');
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings.theme).toBe('default');
    });

    it('toggleSettings flips showSettings without persisting', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        act(() => result.current.toggleSettings());
        expect(result.current.settings.showSettings).toBe(true);
        act(() => result.current.toggleSettings());
        expect(result.current.settings.showSettings).toBe(false);
    });

    it('toggleOpenLinksInNewTab persists JSON to localStorage', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        act(() => result.current.toggleOpenLinksInNewTab());
        expect(result.current.settings.openLinkInNewTab).toBe(true);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('setTheme, setFont and setSpacing persist to localStorage', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        act(() => result.current.setTheme('night'));
        act(() => result.current.setFont('20'));
        act(() => result.current.setSpacing('4'));
        expect(result.current.settings.theme).toBe('night');
        expect(result.current.settings.titleFontSize).toBe('20');
        expect(result.current.settings.listSpacing).toBe('4');
        expect(localStorage.getItem('theme')).toBe('night');
        expect(localStorage.getItem('titleFontSize')).toBe('20');
        expect(localStorage.getItem('listSpacing')).toBe('4');
    });

    it('reacts to system color scheme changes and persists the theme', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        act(() => {
            changeListeners.forEach((listener) =>
                listener({ matches: true } as MediaQueryListEvent),
            );
        });
        expect(result.current.settings.theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');
    });

    it('removes the media query listener on unmount', () => {
        const { unmount } = renderHook(() => useSettings(), { wrapper });
        expect(changeListeners.length).toBe(1);
        unmount();
        expect(changeListeners.length).toBe(0);
    });

    it('throws when useSettings is used outside SettingsProvider', () => {
        expect(() => renderHook(() => useSettings())).toThrow(
            'useSettings must be used within a SettingsProvider',
        );
    });
});
