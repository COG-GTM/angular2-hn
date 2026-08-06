import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';

import { SettingsProvider, useSettings } from './SettingsContext';

const wrapper = ({ children }: { children: ReactNode }) => <SettingsProvider>{children}</SettingsProvider>;

beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
        'matchMedia',
        vi.fn().mockReturnValue({
            matches: false,
            media: '(prefers-color-scheme: dark)',
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        })
    );
});

describe('useSettings', () => {
    it('provides default settings', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings).toEqual({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
    });

    it('reads saved settings from localStorage', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('theme', 'night');
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '8');
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings).toEqual({
            showSettings: false,
            openLinkInNewTab: true,
            theme: 'night',
            titleFontSize: '20',
            listSpacing: '8',
        });
    });

    it('persists theme changes to localStorage', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        act(() => result.current.setTheme('amoledblack'));
        expect(result.current.settings.theme).toBe('amoledblack');
        expect(localStorage.getItem('theme')).toBe('amoledblack');
    });

    it('toggles openLinkInNewTab and persists it', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        act(() => result.current.toggleOpenLinksInNewTab());
        expect(result.current.settings.openLinkInNewTab).toBe(true);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('persists font size and spacing', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        act(() => {
            result.current.setFont('18');
            result.current.setSpacing('4');
        });
        expect(localStorage.getItem('titleFontSize')).toBe('18');
        expect(localStorage.getItem('listSpacing')).toBe('4');
    });

    it('toggles showSettings without persisting it', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        act(() => result.current.toggleSettings());
        expect(result.current.settings.showSettings).toBe(true);
        expect(localStorage.getItem('showSettings')).toBeNull();
    });
});
