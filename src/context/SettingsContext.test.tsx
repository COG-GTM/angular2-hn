import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReactNode } from 'react';
import { SettingsProvider, useSettings } from './SettingsContext';

type Listener = (event: MediaQueryListEvent) => void;

function mockMatchMedia(matches: boolean) {
    const listeners = new Set<Listener>();
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches,
        media: query,
        onchange: null,
        addEventListener: (_type: string, cb: Listener) => listeners.add(cb),
        removeEventListener: (_type: string, cb: Listener) => listeners.delete(cb),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
    }));
    return {
        emit: (value: boolean) => listeners.forEach((cb) => cb({ matches: value } as MediaQueryListEvent)),
    };
}

const wrapper = ({ children }: { children: ReactNode }) => <SettingsProvider>{children}</SettingsProvider>;

describe('SettingsContext', () => {
    beforeEach(() => {
        localStorage.clear();
        mockMatchMedia(false);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('provides default settings when nothing is stored', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings).toMatchObject({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
    });

    it('uses the night theme initially when the system prefers a dark color scheme', () => {
        mockMatchMedia(true);
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings.theme).toBe('night');
    });

    it('prefers a persisted theme over the system preference', () => {
        mockMatchMedia(true);
        localStorage.setItem('theme', 'amoledblack');
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings.theme).toBe('amoledblack');
    });

    it('updates state and persists each setter to localStorage', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });

        act(() => result.current.setTheme('night'));
        expect(result.current.settings.theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');

        act(() => result.current.setFont('20'));
        expect(result.current.settings.titleFontSize).toBe('20');
        expect(localStorage.getItem('titleFontSize')).toBe('20');

        act(() => result.current.setSpacing('5'));
        expect(result.current.settings.listSpacing).toBe('5');
        expect(localStorage.getItem('listSpacing')).toBe('5');

        act(() => result.current.toggleOpenLinksInNewTab());
        expect(result.current.settings.openLinkInNewTab).toBe(true);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');

        act(() => result.current.toggleSettings());
        expect(result.current.settings.showSettings).toBe(true);
    });

    it('round-trips persisted values into a freshly mounted provider', () => {
        const first = renderHook(() => useSettings(), { wrapper });
        act(() => {
            first.result.current.setFont('24');
            first.result.current.setSpacing('8');
            first.result.current.toggleOpenLinksInNewTab();
            first.result.current.setTheme('amoledblack');
        });
        first.unmount();

        const second = renderHook(() => useSettings(), { wrapper });
        expect(second.result.current.settings).toMatchObject({
            titleFontSize: '24',
            listSpacing: '8',
            openLinkInNewTab: true,
            theme: 'amoledblack',
        });
    });

    it('reacts to system color scheme changes', () => {
        const media = mockMatchMedia(false);
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings.theme).toBe('default');

        act(() => media.emit(true));
        expect(result.current.settings.theme).toBe('night');

        act(() => media.emit(false));
        expect(result.current.settings.theme).toBe('default');
    });
});
