import { act, render, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { mockMatchMedia } from '../test-utils';
import { SettingsProvider, useSettings } from './index';

const wrapper = ({ children }: { children: ReactNode }) => <SettingsProvider>{children}</SettingsProvider>;
const renderSettings = () => renderHook(() => useSettings(), { wrapper });

describe('SettingsProvider', () => {
    it('uses Angular defaults when nothing is stored', () => {
        expect(renderSettings().result.current.settings).toEqual({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
    });

    it('reads stored values with the Angular keys and applies the theme class to <html>', () => {
        localStorage.setItem('theme', 'amoledblack');
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '4');
        expect(renderSettings().result.current.settings).toMatchObject({
            theme: 'amoledblack',
            openLinkInNewTab: true,
            titleFontSize: '20',
            listSpacing: '4',
        });
        expect(document.documentElement).toHaveClass('amoledblack');
    });

    it.each(['"true"', 'false', '1', 'garbage'])('openLinkInNewTab=%s is false', (raw) => {
        localStorage.setItem('openLinkInNewTab', raw);
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

    it('switches exactly one theme class on <html>', () => {
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

    it('derives AND persists the first-visit theme from prefers-color-scheme (Angular parity)', () => {
        mockMatchMedia(true);
        expect(renderSettings().result.current.settings.theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');
        expect(document.documentElement).toHaveClass('night');
    });

    it('persists the light system theme too', () => {
        renderSettings();
        expect(localStorage.getItem('theme')).toBe('default');
    });

    it('a saved theme wins over the system scheme', () => {
        mockMatchMedia(true);
        localStorage.setItem('theme', 'amoledblack');
        expect(renderSettings().result.current.settings.theme).toBe('amoledblack');
    });

    it('follows live system color-scheme changes and persists them', () => {
        const media = mockMatchMedia(false);
        localStorage.setItem('theme', 'amoledblack');
        const { result } = renderSettings();
        act(() => media.setMatches(true));
        expect(result.current.settings.theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');
        act(() => media.setMatches(false));
        expect(result.current.settings.theme).toBe('default');
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
