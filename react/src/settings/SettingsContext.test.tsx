import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import { mockMatchMedia, type MatchMediaMock } from '../test/matchMedia';
import { SettingsProvider } from './SettingsContext';
import { useSettings } from './useSettings';

function wrapper({ children }: { children: ReactNode }) {
    return <SettingsProvider>{children}</SettingsProvider>;
}

describe('SettingsProvider / useSettings', () => {
    let media: MatchMediaMock;

    beforeEach(() => {
        localStorage.clear();
        media = mockMatchMedia(false);
    });

    it('throws when used outside a provider', () => {
        expect(() => renderHook(() => useSettings())).toThrow('useSettings must be used within a SettingsProvider');
    });

    it('provides defaults when nothing is stored and the system prefers light', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings).toEqual({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
    });

    it('uses the night theme when the system prefers dark and no theme is saved', () => {
        media.setMatches(true);
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings.theme).toBe('night');
    });

    it('prefers a saved theme over the system colour scheme', () => {
        media.setMatches(true);
        localStorage.setItem('theme', 'amoledblack');
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings.theme).toBe('amoledblack');
    });

    it('restores persisted values from localStorage', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '4');
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings.openLinkInNewTab).toBe(true);
        expect(result.current.settings.titleFontSize).toBe('20');
        expect(result.current.settings.listSpacing).toBe('4');
    });

    it('reacts to prefers-color-scheme changes', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(media.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

        act(() => media.dispatchChange(true));
        expect(result.current.settings.theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');

        act(() => media.dispatchChange(false));
        expect(result.current.settings.theme).toBe('default');
        expect(localStorage.getItem('theme')).toBe('default');
    });

    it('removes the media listener on unmount', () => {
        const { unmount } = renderHook(() => useSettings(), { wrapper });
        unmount();
        expect(media.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('toggleSettings flips showSettings without persisting it', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        act(() => result.current.toggleSettings());
        expect(result.current.settings.showSettings).toBe(true);
        act(() => result.current.toggleSettings());
        expect(result.current.settings.showSettings).toBe(false);
        expect(localStorage.getItem('showSettings')).toBeNull();
    });

    it('toggleOpenLinksInNewTab flips and persists the flag', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        act(() => result.current.toggleOpenLinksInNewTab());
        expect(result.current.settings.openLinkInNewTab).toBe(true);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
        act(() => result.current.toggleOpenLinksInNewTab());
        expect(result.current.settings.openLinkInNewTab).toBe(false);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
    });

    it('setTheme, setFont and setSpacing update state and localStorage', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        act(() => {
            result.current.setTheme('amoledblack');
            result.current.setFont('18');
            result.current.setSpacing('2');
        });
        expect(result.current.settings.theme).toBe('amoledblack');
        expect(result.current.settings.titleFontSize).toBe('18');
        expect(result.current.settings.listSpacing).toBe('2');
        expect(localStorage.getItem('theme')).toBe('amoledblack');
        expect(localStorage.getItem('titleFontSize')).toBe('18');
        expect(localStorage.getItem('listSpacing')).toBe('2');
    });
});
