import React from 'react';
import { act, render, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsContextValue, SettingsProvider, useSettings } from './SettingsContext';

interface FakeMatchMedia {
    mql: MediaQueryList;
    trigger(matches: boolean): void;
}

function installMatchMedia(initialMatches: boolean): FakeMatchMedia {
    let matches = initialMatches;
    const listeners = new Set<(event: MediaQueryListEvent) => void>();

    const mql = {
        media: '(prefers-color-scheme: dark)',
        get matches() {
            return matches;
        },
        onchange: null,
        addEventListener: (_type: string, cb: (event: MediaQueryListEvent) => void) => {
            listeners.add(cb);
        },
        removeEventListener: (_type: string, cb: (event: MediaQueryListEvent) => void) => {
            listeners.delete(cb);
        },
        addListener: (cb: (event: MediaQueryListEvent) => void) => {
            listeners.add(cb);
        },
        removeListener: (cb: (event: MediaQueryListEvent) => void) => {
            listeners.delete(cb);
        },
        dispatchEvent: () => true,
    } as unknown as MediaQueryList;

    window.matchMedia = vi.fn().mockImplementation(() => mql);

    return {
        mql,
        trigger(next: boolean) {
            matches = next;
            listeners.forEach((cb) =>
                cb({ matches: next, media: mql.media } as MediaQueryListEvent)
            );
        },
    };
}

function renderSettings() {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SettingsProvider>{children}</SettingsProvider>
    );
    return renderHook(() => useSettings(), { wrapper });
}

beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('SettingsProvider initial state', () => {
    it('uses defaults when localStorage is empty', () => {
        installMatchMedia(false);
        const { result } = renderSettings();

        expect(result.current.settings.showSettings).toBe(false);
        expect(result.current.settings.openLinkInNewTab).toBe(false);
        expect(result.current.settings.titleFontSize).toBe('16');
        expect(result.current.settings.listSpacing).toBe('0');
    });

    it('reads persisted values from localStorage', () => {
        installMatchMedia(false);
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '2');

        const { result } = renderSettings();

        expect(result.current.settings.openLinkInNewTab).toBe(true);
        expect(result.current.settings.titleFontSize).toBe('20');
        expect(result.current.settings.listSpacing).toBe('2');
    });
});

describe('theme initialization', () => {
    it('applies the saved theme without overwriting localStorage', () => {
        installMatchMedia(true);
        localStorage.setItem('theme', 'amoledblack');

        const { result } = renderSettings();

        expect(result.current.settings.theme).toBe('amoledblack');
        expect(localStorage.getItem('theme')).toBe('amoledblack');
        expect(document.documentElement.classList.contains('amoledblack')).toBe(true);
    });

    it('applies system dark preference when no theme is saved', () => {
        installMatchMedia(true);

        const { result } = renderSettings();

        expect(result.current.settings.theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');
        expect(document.documentElement.classList.contains('night')).toBe(true);
    });

    it('applies default theme when system prefers light and no theme is saved', () => {
        installMatchMedia(false);

        const { result } = renderSettings();

        expect(result.current.settings.theme).toBe('default');
        expect(localStorage.getItem('theme')).toBe('default');
        expect(document.documentElement.classList.contains('default')).toBe(true);
    });

    it('updates the theme when the media query changes', () => {
        const media = installMatchMedia(false);
        const { result } = renderSettings();

        expect(result.current.settings.theme).toBe('default');

        act(() => media.trigger(true));
        expect(result.current.settings.theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');
        expect(document.documentElement.classList.contains('night')).toBe(true);
        expect(document.documentElement.classList.contains('default')).toBe(false);

        act(() => media.trigger(false));
        expect(result.current.settings.theme).toBe('default');
        expect(localStorage.getItem('theme')).toBe('default');
    });
});

describe('setters persist to localStorage', () => {
    it('setTheme sets state and persists', () => {
        installMatchMedia(false);
        const { result } = renderSettings();

        act(() => result.current.setTheme('night'));
        expect(result.current.settings.theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');
    });

    it('setFont sets titleFontSize and persists', () => {
        installMatchMedia(false);
        const { result } = renderSettings();

        act(() => result.current.setFont('18'));
        expect(result.current.settings.titleFontSize).toBe('18');
        expect(localStorage.getItem('titleFontSize')).toBe('18');
    });

    it('setSpacing sets listSpacing and persists', () => {
        installMatchMedia(false);
        const { result } = renderSettings();

        act(() => result.current.setSpacing('3'));
        expect(result.current.settings.listSpacing).toBe('3');
        expect(localStorage.getItem('listSpacing')).toBe('3');
    });

    it('toggleOpenLinksInNewTab flips and persists JSON boolean', () => {
        installMatchMedia(false);
        const { result } = renderSettings();

        expect(result.current.settings.openLinkInNewTab).toBe(false);

        act(() => result.current.toggleOpenLinksInNewTab());
        expect(result.current.settings.openLinkInNewTab).toBe(true);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');

        act(() => result.current.toggleOpenLinksInNewTab());
        expect(result.current.settings.openLinkInNewTab).toBe(false);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
    });

    it('toggleSettings flips showSettings without persisting', () => {
        installMatchMedia(false);
        const { result } = renderSettings();

        expect(result.current.settings.showSettings).toBe(false);

        act(() => result.current.toggleSettings());
        expect(result.current.settings.showSettings).toBe(true);
        expect(localStorage.getItem('showSettings')).toBeNull();

        act(() => result.current.toggleSettings());
        expect(result.current.settings.showSettings).toBe(false);
    });
});

describe('useSettings guard', () => {
    it('throws when used outside a provider', () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        expect(() => renderHook(() => useSettings())).toThrow(
            'useSettings must be used within a SettingsProvider'
        );
        errorSpy.mockRestore();
    });

    it('provides context to consumers', () => {
        installMatchMedia(false);
        let captured: SettingsContextValue | undefined;

        function Consumer() {
            captured = useSettings();
            return <span>{captured.settings.theme}</span>;
        }

        render(
            <SettingsProvider>
                <Consumer />
            </SettingsProvider>
        );

        expect(screen.getByText('default')).toBeDefined();
        expect(captured).toBeDefined();
    });
});
