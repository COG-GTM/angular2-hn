import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SettingsProvider } from './SettingsProvider';
import { useSettings } from './settingsContext';

function wrapper({ children }: { children: ReactNode }) {
    return <SettingsProvider>{children}</SettingsProvider>;
}

function renderSettings() {
    return renderHook(() => useSettings(), { wrapper });
}

describe('SettingsProvider', () => {
    it('starts with the documented defaults', () => {
        const { result } = renderSettings();

        expect(result.current.settings).toEqual({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
    });

    it('hydrates settings from localStorage', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('theme', 'amoledblack');
        localStorage.setItem('titleFontSize', '22');
        localStorage.setItem('listSpacing', '12');

        const { result } = renderSettings();

        expect(result.current.settings).toEqual({
            showSettings: false,
            openLinkInNewTab: true,
            theme: 'amoledblack',
            titleFontSize: '22',
            listSpacing: '12',
        });
    });

    it('falls back to the night theme when the system prefers dark and nothing is saved', () => {
        globalThis.mediaQueryListMock.matches = true;

        const { result } = renderSettings();

        expect(result.current.settings.theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');
    });

    it('keeps the saved theme even when the system prefers dark', () => {
        localStorage.setItem('theme', 'default');
        globalThis.mediaQueryListMock.matches = true;

        const { result } = renderSettings();

        expect(result.current.settings.theme).toBe('default');
    });

    it('follows later system color scheme changes', () => {
        const { result } = renderSettings();

        act(() => globalThis.mediaQueryListMock.emitChange(true));
        expect(result.current.settings.theme).toBe('night');

        act(() => globalThis.mediaQueryListMock.emitChange(false));
        expect(result.current.settings.theme).toBe('default');
    });

    it('stops listening for color scheme changes once unmounted', () => {
        const { result, unmount } = renderSettings();
        unmount();

        expect(() => globalThis.mediaQueryListMock.emitChange(true)).not.toThrow();
        expect(result.current.settings.theme).toBe('default');
    });

    it('toggles the settings dialog', () => {
        const { result } = renderSettings();

        act(() => result.current.toggleSettings());
        expect(result.current.settings.showSettings).toBe(true);

        act(() => result.current.toggleSettings());
        expect(result.current.settings.showSettings).toBe(false);
    });

    it('persists the open-links-in-new-tab preference', () => {
        const { result } = renderSettings();

        act(() => result.current.toggleOpenLinksInNewTab());

        expect(result.current.settings.openLinkInNewTab).toBe(true);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('persists theme, font size and list spacing', () => {
        const { result } = renderSettings();

        act(() => result.current.setTheme('night'));
        act(() => result.current.setFont('20'));
        act(() => result.current.setSpacing('8'));

        expect(result.current.settings).toMatchObject({ theme: 'night', titleFontSize: '20', listSpacing: '8' });
        expect(localStorage.getItem('theme')).toBe('night');
        expect(localStorage.getItem('titleFontSize')).toBe('20');
        expect(localStorage.getItem('listSpacing')).toBe('8');
    });

    it('throws when used outside of the provider', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => renderHook(() => useSettings())).toThrow('useSettings must be used within a SettingsProvider');
    });
});
