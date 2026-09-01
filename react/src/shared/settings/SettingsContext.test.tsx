import { act, renderHook } from '@testing-library/react';

import { SettingsProvider, useSettings } from './SettingsContext';

describe('SettingsContext', () => {
    let mediaQuery: {
        matches: boolean;
        media: string;
        addEventListener: ReturnType<typeof vi.fn>;
        removeEventListener: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        localStorage.clear();
        mediaQuery = {
            matches: false,
            media: '(prefers-color-scheme: dark)',
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        };
        Object.defineProperty(window, 'matchMedia', {
            configurable: true,
            writable: true,
            value: vi.fn(() => mediaQuery),
        });
    });

    it('uses the default settings', () => {
        const { result } = renderHook(() => useSettings(), { wrapper: SettingsProvider });

        expect(result.current.settings).toEqual({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
    });

    it('reads persisted settings', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '2');

        const { result } = renderHook(() => useSettings(), { wrapper: SettingsProvider });

        expect(result.current.settings.openLinkInNewTab).toBe(true);
        expect(result.current.settings.titleFontSize).toBe('20');
        expect(result.current.settings.listSpacing).toBe('2');
    });

    it('prefers a saved theme without writing it', () => {
        localStorage.setItem('theme', 'amoledblack');
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

        const { result } = renderHook(() => useSettings(), { wrapper: SettingsProvider });

        expect(result.current.settings.theme).toBe('amoledblack');
        expect(setItemSpy).not.toHaveBeenCalled();
    });

    it('persists night when no theme is saved and dark mode is preferred', () => {
        mediaQuery.matches = true;

        const { result } = renderHook(() => useSettings(), { wrapper: SettingsProvider });

        expect(result.current.settings.theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');
    });

    it('persists default when no theme is saved and light mode is preferred', () => {
        const { result } = renderHook(() => useSettings(), { wrapper: SettingsProvider });

        expect(result.current.settings.theme).toBe('default');
        expect(localStorage.getItem('theme')).toBe('default');
    });

    it('updates theme when the media preference changes', () => {
        const { result } = renderHook(() => useSettings(), { wrapper: SettingsProvider });
        const listener = mediaQuery.addEventListener.mock.calls[0][1];

        act(() => listener({ matches: true }));
        expect(result.current.settings.theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');

        act(() => listener({ matches: false }));
        expect(result.current.settings.theme).toBe('default');
        expect(localStorage.getItem('theme')).toBe('default');
    });

    it('updates and persists each setting through its setter', () => {
        const { result } = renderHook(() => useSettings(), { wrapper: SettingsProvider });

        act(() => result.current.toggleOpenLinksInNewTab());
        expect(result.current.settings.openLinkInNewTab).toBe(true);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');

        act(() => result.current.setTheme('night'));
        expect(result.current.settings.theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');

        act(() => result.current.setFont('22'));
        expect(result.current.settings.titleFontSize).toBe('22');
        expect(localStorage.getItem('titleFontSize')).toBe('22');

        act(() => result.current.setSpacing('3'));
        expect(result.current.settings.listSpacing).toBe('3');
        expect(localStorage.getItem('listSpacing')).toBe('3');
    });

    it('toggles settings visibility', () => {
        const { result } = renderHook(() => useSettings(), { wrapper: SettingsProvider });

        act(() => result.current.toggleSettings());
        expect(result.current.settings.showSettings).toBe(true);

        act(() => result.current.toggleSettings());
        expect(result.current.settings.showSettings).toBe(false);
    });

    it('removes the media listener on unmount', () => {
        const { unmount } = renderHook(() => useSettings(), { wrapper: SettingsProvider });
        const listener = mediaQuery.addEventListener.mock.calls[0][1];

        unmount();

        expect(mediaQuery.removeEventListener).toHaveBeenCalledWith('change', listener);
    });

    it('throws when used outside the provider', () => {
        expect(() => renderHook(() => useSettings())).toThrow('useSettings must be used within a SettingsProvider');
    });
});
