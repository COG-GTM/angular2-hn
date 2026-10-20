import { act, render, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { mockMatchMedia } from '../test-utils';
import { SettingsProvider, useSettings } from './index';

const wrapper = ({ children }: { children: ReactNode }) => <SettingsProvider>{children}</SettingsProvider>;

function renderSettings() {
    return renderHook(() => useSettings(), { wrapper });
}

describe('SettingsProvider', () => {
    it('uses Angular defaults when nothing is stored', () => {
        const { result } = renderSettings();
        expect(result.current.settings).toEqual({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
    });

    it('reads stored values with the Angular keys', () => {
        localStorage.setItem('theme', 'amoledblack');
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '4');
        const { result } = renderSettings();
        expect(result.current.settings).toMatchObject({
            theme: 'amoledblack',
            openLinkInNewTab: true,
            titleFontSize: '20',
            listSpacing: '4',
        });
        expect(document.documentElement).toHaveClass('amoledblack');
    });

    it('only treats a stored JSON true as true', () => {
        localStorage.setItem('openLinkInNewTab', '"false"');
        expect(renderSettings().result.current.settings.openLinkInNewTab).toBe(false);
    });

    it('persists every setter to localStorage', () => {
        const { result } = renderSettings();
        act(() => result.current.toggleOpenLinksInNewTab());
        act(() => result.current.setFont('22'));
        act(() => result.current.setSpacing('3'));
        act(() => result.current.setTheme('night'));
        expect(result.current.settings).toMatchObject({
            openLinkInNewTab: true,
            titleFontSize: '22',
            listSpacing: '3',
            theme: 'night',
        });
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
        expect(localStorage.getItem('titleFontSize')).toBe('22');
        expect(localStorage.getItem('listSpacing')).toBe('3');
        expect(localStorage.getItem('theme')).toBe('night');
        act(() => result.current.toggleOpenLinksInNewTab());
        expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
    });

    it('toggles showSettings without persisting it', () => {
        const { result } = renderSettings();
        act(() => result.current.toggleSettings());
        expect(result.current.settings.showSettings).toBe(true);
        act(() => result.current.toggleSettings());
        expect(result.current.settings.showSettings).toBe(false);
        expect(localStorage.getItem('showSettings')).toBeNull();
    });

    it('applies the theme class to <html> and removes the others', () => {
        document.documentElement.classList.add('keep-me');
        const { result } = renderSettings();
        expect(document.documentElement).toHaveClass('default');
        act(() => result.current.setTheme('night'));
        expect(document.documentElement).toHaveClass('night', 'keep-me');
        expect(document.documentElement).not.toHaveClass('default');
        act(() => result.current.setTheme('amoledblack'));
        expect(document.documentElement).toHaveClass('amoledblack');
        expect(document.documentElement).not.toHaveClass('night');
        document.documentElement.classList.remove('keep-me');
    });

    it('derives and persists the initial theme from prefers-color-scheme (Angular parity)', () => {
        mockMatchMedia(true);
        const { result } = renderSettings();
        expect(result.current.settings.theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');
        expect(document.documentElement).toHaveClass('night');
    });

    it('a saved theme wins over the system scheme', () => {
        mockMatchMedia(true);
        localStorage.setItem('theme', 'default');
        expect(renderSettings().result.current.settings.theme).toBe('default');
    });

    it('follows system color-scheme changes', () => {
        let listener: ((e: MediaQueryListEvent) => void) | undefined;
        vi.stubGlobal(
            'matchMedia',
            vi.fn((query: string) => ({
                matches: false,
                media: query,
                addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => (listener = cb),
                removeEventListener: vi.fn(),
            }))
        );
        const { result } = renderSettings();
        act(() => listener?.({ matches: true } as MediaQueryListEvent));
        expect(result.current.settings.theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');
    });

    it('useSettings throws outside the provider', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        function Orphan() {
            useSettings();
            return null;
        }
        expect(() => render(<Orphan />)).toThrow(/SettingsProvider/);
    });
});
