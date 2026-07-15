import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { SettingsProvider, useSettings } from './SettingsContext';
import { mockMatchMedia } from '../test/setup';

function wrapper({ children }: { children: ReactNode }) {
    return <SettingsProvider>{children}</SettingsProvider>;
}

beforeEach(() => {
    localStorage.clear();
    mockMatchMedia(false);
});

describe('SettingsContext', () => {
    it('provides defaults from an empty localStorage', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings.titleFontSize).toBe('16');
        expect(result.current.settings.listSpacing).toBe('0');
        expect(result.current.settings.openLinkInNewTab).toBe(false);
        expect(result.current.settings.showSettings).toBe(false);
    });

    it('reads initial values from localStorage', () => {
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '5');
        localStorage.setItem('openLinkInNewTab', 'true');
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings.titleFontSize).toBe('20');
        expect(result.current.settings.listSpacing).toBe('5');
        expect(result.current.settings.openLinkInNewTab).toBe(true);
    });

    it('setTheme persists to localStorage', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        act(() => result.current.setTheme('amoledblack'));
        expect(result.current.settings.theme).toBe('amoledblack');
        expect(localStorage.getItem('theme')).toBe('amoledblack');
    });

    it('setFont persists to localStorage', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        act(() => result.current.setFont('22'));
        expect(result.current.settings.titleFontSize).toBe('22');
        expect(localStorage.getItem('titleFontSize')).toBe('22');
    });

    it('setSpacing persists to localStorage', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        act(() => result.current.setSpacing('8'));
        expect(result.current.settings.listSpacing).toBe('8');
        expect(localStorage.getItem('listSpacing')).toBe('8');
    });

    it('toggleOpenLinksInNewTab persists to localStorage', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        act(() => result.current.toggleOpenLinksInNewTab());
        expect(result.current.settings.openLinkInNewTab).toBe(true);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('toggleSettings flips showSettings without persisting', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        act(() => result.current.toggleSettings());
        expect(result.current.settings.showSettings).toBe(true);
        act(() => result.current.toggleSettings());
        expect(result.current.settings.showSettings).toBe(false);
    });

    it('selects the night theme when the system prefers dark and no theme is saved', () => {
        mockMatchMedia(true);
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings.theme).toBe('night');
    });

    it('selects the default theme when the system does not prefer dark and no theme is saved', () => {
        mockMatchMedia(false);
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings.theme).toBe('default');
    });

    it('a saved theme overrides the system color-scheme preference', () => {
        localStorage.setItem('theme', 'amoledblack');
        mockMatchMedia(true);
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings.theme).toBe('amoledblack');
    });

    it('reacts to a system color-scheme change event', () => {
        const media = mockMatchMedia(false);
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings.theme).toBe('default');
        act(() => {
            media.dispatchEvent({ matches: true });
        });
        expect(result.current.settings.theme).toBe('night');
    });
});
