import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { SettingsProvider, useSettings } from './SettingsContext';

const wrapper = ({ children }: { children: ReactNode }) => <SettingsProvider>{children}</SettingsProvider>;

describe('SettingsContext', () => {
    it('reads persisted settings', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('theme', 'amoledblack');
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '8');

        const { result } = renderHook(() => useSettings(), { wrapper });

        expect(result.current.settings).toMatchObject({
            openLinkInNewTab: true,
            theme: 'amoledblack',
            titleFontSize: '20',
            listSpacing: '8',
        });
    });

    it('ignores a corrupted openLinkInNewTab value instead of throwing', () => {
        localStorage.setItem('openLinkInNewTab', 'not-json');

        const { result } = renderHook(() => useSettings(), { wrapper });

        expect(result.current.settings.openLinkInNewTab).toBe(false);
    });

    it('persists mutations', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });

        act(() => result.current.setTheme('night'));
        act(() => result.current.setFont('18'));
        act(() => result.current.setSpacing('4'));
        act(() => result.current.toggleOpenLinksInNewTab());

        expect(result.current.settings).toMatchObject({
            theme: 'night',
            titleFontSize: '18',
            listSpacing: '4',
            openLinkInNewTab: true,
        });
        expect(localStorage.getItem('theme')).toBe('night');
        expect(localStorage.getItem('titleFontSize')).toBe('18');
        expect(localStorage.getItem('listSpacing')).toBe('4');
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('toggles the settings popup without persisting it', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });

        act(() => result.current.toggleSettings());

        expect(result.current.settings.showSettings).toBe(true);
        expect(localStorage.getItem('showSettings')).toBeNull();
    });
});
