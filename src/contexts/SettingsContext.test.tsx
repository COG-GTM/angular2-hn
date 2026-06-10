import { describe, expect, it } from 'vitest';
import { act, render, renderHook, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { SettingsProvider, useSettings } from './SettingsContext';

function wrapper({ children }: { children: ReactNode }) {
    return <SettingsProvider>{children}</SettingsProvider>;
}

describe('SettingsContext', () => {
    it('falls back to default values when localStorage is empty', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings.theme).toBe('default');
        expect(result.current.settings.titleFontSize).toBe('16');
        expect(result.current.settings.listSpacing).toBe('0');
        expect(result.current.settings.openLinkInNewTab).toBe(false);
        expect(result.current.settings.showSettings).toBe(false);
    });

    it('reads persisted settings from localStorage', () => {
        localStorage.setItem('theme', 'amoledblack');
        localStorage.setItem('titleFontSize', '20');
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings.theme).toBe('amoledblack');
        expect(result.current.settings.titleFontSize).toBe('20');
    });

    it('setTheme updates state and persists to localStorage', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        act(() => result.current.setTheme('night'));
        expect(result.current.settings.theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');
    });

    it('toggleOpenLinksInNewTab flips and persists the value', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        act(() => result.current.toggleOpenLinksInNewTab());
        expect(result.current.settings.openLinkInNewTab).toBe(true);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('toggleSettings flips the panel visibility without persisting', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        act(() => result.current.toggleSettings());
        expect(result.current.settings.showSettings).toBe(true);
        expect(localStorage.getItem('showSettings')).toBeNull();
    });

    it('throws when useSettings is called outside the provider', () => {
        function Orphan() {
            useSettings();
            return null;
        }
        expect(() => render(<Orphan />)).toThrow(/within a SettingsProvider/);
        // avoid unused import lint on screen
        expect(screen.queryByText('never')).toBeNull();
    });
});
