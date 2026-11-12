import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import { SettingsProvider } from './SettingsProvider';
import { useSettings } from './useSettings';

function mockColorScheme(dark: boolean) {
    const listeners: ((e: MediaQueryListEvent) => void)[] = [];
    window.matchMedia = vi.fn().mockReturnValue({
        matches: dark,
        media: '(prefers-color-scheme: dark)',
        addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.push(cb),
        removeEventListener: vi.fn(),
    });
    return (matches: boolean) => listeners.forEach((cb) => cb({ matches } as MediaQueryListEvent));
}

const wrapper = ({ children }: { children: ReactNode }) => <SettingsProvider>{children}</SettingsProvider>;

describe('SettingsProvider', () => {
    it('uses defaults and follows the system color scheme when nothing is saved', () => {
        mockColorScheme(true);
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings).toEqual({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'night',
            titleFontSize: '16',
            listSpacing: '0',
        });
        expect(localStorage.getItem('theme')).toBe('night');
    });

    it('restores saved settings from localStorage', () => {
        mockColorScheme(true);
        localStorage.setItem('theme', 'amoledblack');
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '5');
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings).toMatchObject({
            theme: 'amoledblack',
            openLinkInNewTab: true,
            titleFontSize: '20',
            listSpacing: '5',
        });
    });

    it('persists changes and reacts to system color scheme changes', () => {
        const emit = mockColorScheme(false);
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings.theme).toBe('default');

        act(() => result.current.toggleSettings());
        expect(result.current.settings.showSettings).toBe(true);

        act(() => result.current.toggleOpenLinksInNewTab());
        act(() => result.current.setFont('18'));
        act(() => result.current.setSpacing('4'));
        act(() => result.current.setTheme('amoledblack'));
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
        expect(localStorage.getItem('titleFontSize')).toBe('18');
        expect(localStorage.getItem('listSpacing')).toBe('4');
        expect(localStorage.getItem('theme')).toBe('amoledblack');

        act(() => emit(true));
        expect(result.current.settings.theme).toBe('night');
    });
});
