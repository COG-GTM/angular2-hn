import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { SettingsProvider, readStoredSettings, useSettings } from './settingsContext';

let mediaListeners: Array<(event: { matches: boolean }) => void> = [];

function stubMatchMedia(matches: boolean) {
    vi.stubGlobal(
        'matchMedia',
        vi.fn().mockImplementation((media: string) => ({
            media,
            matches,
            addEventListener: (_: string, listener: (event: { matches: boolean }) => void) =>
                mediaListeners.push(listener),
            removeEventListener: (_: string, listener: (event: { matches: boolean }) => void) => {
                mediaListeners = mediaListeners.filter(existing => existing !== listener);
            },
        }))
    );
}

const wrapper = ({ children }: { children: ReactNode }) => <SettingsProvider>{children}</SettingsProvider>;

beforeEach(() => {
    localStorage.clear();
    mediaListeners = [];
    stubMatchMedia(false);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('readStoredSettings', () => {
    it('falls back to the Angular defaults when nothing is stored', () => {
        expect(readStoredSettings()).toEqual({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
    });

    it('reads persisted values from localStorage', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('theme', 'night');
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '10');

        expect(readStoredSettings()).toEqual({
            showSettings: false,
            openLinkInNewTab: true,
            theme: 'night',
            titleFontSize: '20',
            listSpacing: '10',
        });
    });
});

describe('SettingsProvider', () => {
    it('persists setters to localStorage', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });

        act(() => result.current.setFont('20'));
        act(() => result.current.setSpacing('12'));
        act(() => result.current.setTheme('amoledblack'));
        act(() => result.current.toggleOpenLinksInNewTab());

        expect(result.current.settings.titleFontSize).toBe('20');
        expect(result.current.settings.listSpacing).toBe('12');
        expect(result.current.settings.theme).toBe('amoledblack');
        expect(result.current.settings.openLinkInNewTab).toBe(true);
        expect(localStorage.getItem('titleFontSize')).toBe('20');
        expect(localStorage.getItem('listSpacing')).toBe('12');
        expect(localStorage.getItem('theme')).toBe('amoledblack');
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('toggles the settings panel flag', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });

        act(() => result.current.toggleSettings());

        expect(result.current.settings.showSettings).toBe(true);
    });

    it('applies the system dark colour scheme when no theme is stored', () => {
        stubMatchMedia(true);

        const { result } = renderHook(() => useSettings(), { wrapper });

        expect(result.current.settings.theme).toBe('night');
    });

    it('keeps a stored theme instead of the system colour scheme', () => {
        localStorage.setItem('theme', 'default');
        stubMatchMedia(true);

        const { result } = renderHook(() => useSettings(), { wrapper });

        expect(result.current.settings.theme).toBe('default');
    });

    it('reacts to colour scheme changes', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });

        act(() => mediaListeners.forEach(listener => listener({ matches: true })));

        expect(result.current.settings.theme).toBe('night');
    });

    it('exposes the settings to consumers', async () => {
        function Consumer() {
            const { settings, toggleOpenLinksInNewTab } = useSettings();
            return (
                <button onClick={toggleOpenLinksInNewTab}>
                    {settings.openLinkInNewTab ? 'new tab' : 'same tab'}
                </button>
            );
        }

        render(
            <SettingsProvider>
                <Consumer />
            </SettingsProvider>
        );
        await userEvent.click(screen.getByRole('button'));

        expect(screen.getByRole('button')).toHaveTextContent('new tab');
    });
});
