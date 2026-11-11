import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SettingsProvider, useSettings } from '.';

type Listener = (e: MediaQueryListEvent) => void;

function mockMatchMedia(matches: boolean) {
    const listeners: Listener[] = [];
    vi.stubGlobal(
        'matchMedia',
        vi.fn(() => ({
            matches,
            media: '(prefers-color-scheme: dark)',
            addEventListener: (_: string, l: Listener) => listeners.push(l),
            removeEventListener: vi.fn(),
        }))
    );
    return (dark: boolean) => listeners.forEach((l) => l({ matches: dark } as MediaQueryListEvent));
}

const wrapper = ({ children }: { children: ReactNode }) => <SettingsProvider>{children}</SettingsProvider>;

afterEach(() => vi.unstubAllGlobals());

describe('SettingsProvider', () => {
    it('uses the Angular defaults', () => {
        mockMatchMedia(false);
        const { result } = renderHook(useSettings, { wrapper });
        expect(result.current.settings).toEqual({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
        expect(localStorage.getItem('theme')).toBe('default');
    });

    it('follows the dark system scheme when no theme is saved', () => {
        const emit = mockMatchMedia(true);
        const { result } = renderHook(useSettings, { wrapper });
        expect(result.current.settings.theme).toBe('night');
        act(() => emit(false));
        expect(result.current.settings.theme).toBe('default');
    });

    it('reads and writes the same localStorage keys as SettingsService', () => {
        mockMatchMedia(true);
        localStorage.setItem('theme', 'amoledblack');
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '5');
        const { result } = renderHook(useSettings, { wrapper });
        expect(result.current.settings).toMatchObject({
            theme: 'amoledblack',
            openLinkInNewTab: true,
            titleFontSize: '20',
            listSpacing: '5',
        });

        act(() => {
            result.current.setTheme('night');
            result.current.toggleOpenLinksInNewTab();
            result.current.setFont('18');
            result.current.setSpacing('2');
            result.current.toggleSettings();
        });
        expect(result.current.settings.showSettings).toBe(true);
        expect(localStorage.getItem('theme')).toBe('night');
        expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
        expect(localStorage.getItem('titleFontSize')).toBe('18');
        expect(localStorage.getItem('listSpacing')).toBe('2');
    });
});
