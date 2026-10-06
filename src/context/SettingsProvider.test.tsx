import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsProvider, useSettings } from '.';

type ChangeListener = (event: MediaQueryListEvent) => void;

function stubMatchMedia(matches: boolean) {
    const listeners: ChangeListener[] = [];
    vi.stubGlobal(
        'matchMedia',
        vi.fn((media: string) => ({
            media,
            matches,
            addEventListener: (_: string, cb: ChangeListener) => listeners.push(cb),
            removeEventListener: vi.fn(),
        }))
    );
    return (dark: boolean) => listeners.forEach((cb) => cb({ matches: dark } as MediaQueryListEvent));
}

const wrapper = ({ children }: { children: ReactNode }) => <SettingsProvider>{children}</SettingsProvider>;

beforeEach(() => {
    localStorage.clear();
    document.body.className = '';
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('SettingsProvider', () => {
    it('uses defaults when nothing is stored', () => {
        stubMatchMedia(false);
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings).toEqual({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
            defaultFeed: 'news',
        });
        expect(document.body.classList.contains('default')).toBe(true);
    });

    it('falls back to the night theme when the system prefers dark', () => {
        stubMatchMedia(true);
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings.theme).toBe('night');
    });

    it('restores persisted settings from localStorage', () => {
        stubMatchMedia(true);
        localStorage.setItem('theme', 'amoledblack');
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '5');
        localStorage.setItem('defaultFeed', 'ask');
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings).toMatchObject({
            theme: 'amoledblack',
            openLinkInNewTab: true,
            titleFontSize: '20',
            listSpacing: '5',
            defaultFeed: 'ask',
        });
    });

    it('persists updates and toggles the body theme class', () => {
        stubMatchMedia(false);
        const { result } = renderHook(() => useSettings(), { wrapper });

        act(() => result.current.setTheme('night'));
        expect(localStorage.getItem('theme')).toBe('night');
        expect(document.body.classList.contains('night')).toBe(true);
        expect(document.body.classList.contains('default')).toBe(false);

        act(() => result.current.toggleOpenLinksInNewTab());
        expect(result.current.settings.openLinkInNewTab).toBe(true);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');

        act(() => result.current.setFont('22'));
        act(() => result.current.setSpacing('8'));
        act(() => result.current.setDefaultFeed('show'));
        expect(localStorage.getItem('titleFontSize')).toBe('22');
        expect(localStorage.getItem('listSpacing')).toBe('8');
        expect(localStorage.getItem('defaultFeed')).toBe('show');
    });

    it('toggles the settings dialog without persisting it', () => {
        stubMatchMedia(false);
        const { result } = renderHook(() => useSettings(), { wrapper });
        act(() => result.current.toggleSettings());
        expect(result.current.settings.showSettings).toBe(true);
        expect(localStorage.length).toBe(0);
    });

    it('follows system color scheme changes', () => {
        const emit = stubMatchMedia(false);
        const { result } = renderHook(() => useSettings(), { wrapper });
        act(() => emit(true));
        expect(result.current.settings.theme).toBe('night');
    });

    it('throws when used outside the provider', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        expect(() => renderHook(() => useSettings())).toThrow(/SettingsProvider/);
    });
});
