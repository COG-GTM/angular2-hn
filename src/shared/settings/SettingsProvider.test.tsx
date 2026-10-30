import { act, render, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { SettingsProvider } from './SettingsProvider';
import { useSettings } from './settings-context';

type Listener = (event: MediaQueryListEvent) => void;

function mockMatchMedia(matches: boolean) {
    const listeners: Listener[] = [];
    const media = {
        matches,
        media: '(prefers-color-scheme: dark)',
        addEventListener: vi.fn((_type: string, listener: Listener) => listeners.push(listener)),
        removeEventListener: vi.fn(),
    };
    window.matchMedia = vi.fn().mockReturnValue(media);
    return {
        media,
        emit: (dark: boolean) => listeners.forEach((l) => l({ matches: dark } as MediaQueryListEvent)),
    };
}

const wrapper = ({ children }: { children: ReactNode }) => <SettingsProvider>{children}</SettingsProvider>;

describe('SettingsProvider', () => {
    it('reads existing settings from the legacy localStorage keys', () => {
        mockMatchMedia(false);
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '5');
        localStorage.setItem('theme', 'amoledblack');

        const { result } = renderHook(() => useSettings(), { wrapper });

        expect(result.current.settings).toEqual({
            showSettings: false,
            openLinkInNewTab: true,
            titleFontSize: '20',
            listSpacing: '5',
            theme: 'amoledblack',
        });
    });

    it('defaults the theme from prefers-color-scheme', () => {
        mockMatchMedia(true);
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings.theme).toBe('night');
        expect(result.current.settings.titleFontSize).toBe('16');
        expect(result.current.settings.listSpacing).toBe('0');
    });

    it('persists every action to localStorage', () => {
        mockMatchMedia(false);
        const { result } = renderHook(() => useSettings(), { wrapper });

        act(() => result.current.toggleSettings());
        expect(result.current.settings.showSettings).toBe(true);

        act(() => result.current.toggleOpenLinksInNewTab());
        act(() => result.current.setTheme('night'));
        act(() => result.current.setFont('22'));
        act(() => result.current.setSpacing('8'));

        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
        expect(localStorage.getItem('theme')).toBe('night');
        expect(localStorage.getItem('titleFontSize')).toBe('22');
        expect(localStorage.getItem('listSpacing')).toBe('8');
    });

    it('follows system color-scheme changes and unsubscribes on unmount', () => {
        const { media, emit } = mockMatchMedia(false);
        const { result, unmount } = renderHook(() => useSettings(), { wrapper });

        act(() => emit(true));
        expect(result.current.settings.theme).toBe('night');
        act(() => emit(false));
        expect(result.current.settings.theme).toBe('default');

        unmount();
        expect(media.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('throws when used outside the provider', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const Consumer = () => {
            useSettings();
            return null;
        };
        expect(() => render(<Consumer />)).toThrow('useSettings must be used within a SettingsProvider');
    });
});
