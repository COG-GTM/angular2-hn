import { act, render, renderHook, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { SettingsProvider, useSettings } from './SettingsContext';

function wrapper({ children }: { children: ReactNode }) {
    return <SettingsProvider>{children}</SettingsProvider>;
}

function mockPrefersDark(matches: boolean) {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    }));
}

describe('SettingsContext', () => {
    it('defaults to the light theme', () => {
        mockPrefersDark(false);
        const { result } = renderHook(() => useSettings(), { wrapper });

        expect(result.current.settings.theme).toBe('default');
        expect(result.current.settings.openLinkInNewTab).toBe(false);
        expect(result.current.settings.titleFontSize).toBe('16');
    });

    it('defaults to the night theme when the system prefers dark', () => {
        mockPrefersDark(true);
        const { result } = renderHook(() => useSettings(), { wrapper });

        expect(result.current.settings.theme).toBe('night');
    });

    it('persists settings to local storage', () => {
        mockPrefersDark(false);
        const { result } = renderHook(() => useSettings(), { wrapper });

        act(() => result.current.setTheme('amoledblack'));
        act(() => result.current.setFont('20'));
        act(() => result.current.setSpacing('5'));
        act(() => result.current.toggleOpenLinksInNewTab());

        expect(result.current.settings).toMatchObject({
            theme: 'amoledblack',
            titleFontSize: '20',
            listSpacing: '5',
            openLinkInNewTab: true,
        });
        expect(localStorage.getItem('theme')).toBe('amoledblack');
        expect(localStorage.getItem('titleFontSize')).toBe('20');
        expect(localStorage.getItem('listSpacing')).toBe('5');
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('restores persisted settings', () => {
        mockPrefersDark(true);
        localStorage.setItem('theme', 'default');
        localStorage.setItem('titleFontSize', '18');

        const { result } = renderHook(() => useSettings(), { wrapper });

        expect(result.current.settings.theme).toBe('default');
        expect(result.current.settings.titleFontSize).toBe('18');
    });

    it('throws when used outside of the provider', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

        function Consumer() {
            useSettings();
            return null;
        }

        expect(() => render(<Consumer />)).toThrow('useSettings must be used within a SettingsProvider');
        consoleError.mockRestore();
        expect(screen.queryByRole('main')).toBeNull();
    });
});
