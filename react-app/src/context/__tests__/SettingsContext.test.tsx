import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';

import { SettingsProvider, useSettings } from '../SettingsContext';

function setMatchMedia(matches: boolean) {
    vi.stubGlobal(
        'matchMedia',
        vi.fn(() => ({
            matches,
            media: '(prefers-color-scheme: dark)',
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        }))
    );
}

const wrapper = ({ children }: { children: ReactNode }) => <SettingsProvider>{children}</SettingsProvider>;

beforeEach(() => {
    localStorage.clear();
    setMatchMedia(false);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('SettingsContext', () => {
    it('starts from the documented defaults', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });

        expect(result.current.settings).toMatchObject({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
    });

    it('reads persisted values from localStorage', () => {
        localStorage.setItem('theme', 'amoledblack');
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '8');

        const { result } = renderHook(() => useSettings(), { wrapper });

        expect(result.current.settings).toMatchObject({
            theme: 'amoledblack',
            openLinkInNewTab: true,
            titleFontSize: '20',
            listSpacing: '8',
        });
    });

    it('falls back to the system colour scheme when no theme was saved', () => {
        setMatchMedia(true);

        const { result } = renderHook(() => useSettings(), { wrapper });

        expect(result.current.settings.theme).toBe('night');
    });

    it('persists every toggle', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });

        act(() => result.current.toggleOpenLinksInNewTab());
        act(() => result.current.setTheme('night'));
        act(() => result.current.setFont('22'));
        act(() => result.current.setSpacing('4'));

        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
        expect(localStorage.getItem('theme')).toBe('night');
        expect(localStorage.getItem('titleFontSize')).toBe('22');
        expect(localStorage.getItem('listSpacing')).toBe('4');
    });

    it('toggles the settings modal without persisting it', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });

        act(() => result.current.toggleSettings());

        expect(result.current.settings.showSettings).toBe(true);
        expect(localStorage.getItem('showSettings')).toBeNull();
    });
});
