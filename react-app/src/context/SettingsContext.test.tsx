import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { mockMatchMedia } from '../test';
import { SettingsProvider, useSettings } from './SettingsContext';

const wrapper = ({ children }: { children: ReactNode }) => <SettingsProvider>{children}</SettingsProvider>;
const render = () => renderHook(() => useSettings(), { wrapper });

describe('SettingsContext', () => {
    it('uses Angular defaults and saves the system theme on first visit', () => {
        const { result } = render();
        expect(result.current.settings).toEqual({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
        expect(localStorage.getItem('theme')).toBe('default');
    });

    it('reads saved values from localStorage', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('theme', 'amoledblack');
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '4');
        expect(render().result.current.settings).toMatchObject({
            openLinkInNewTab: true,
            theme: 'amoledblack',
            titleFontSize: '20',
            listSpacing: '4',
        });
    });

    it('methods update state and persist', () => {
        const { result } = render();
        act(() => result.current.toggleSettings());
        act(() => result.current.toggleOpenLinksInNewTab());
        act(() => result.current.setTheme('night'));
        act(() => result.current.setFont('18'));
        act(() => result.current.setSpacing('2'));
        expect(result.current.settings).toEqual({
            showSettings: true,
            openLinkInNewTab: true,
            theme: 'night',
            titleFontSize: '18',
            listSpacing: '2',
        });
        expect({ ...localStorage }).toMatchObject({
            openLinkInNewTab: 'true',
            theme: 'night',
            titleFontSize: '18',
            listSpacing: '2',
        });
    });

    it('follows prefers-color-scheme: night when dark, live changes switch theme', () => {
        const media = mockMatchMedia(true);
        const { result } = render();
        expect(result.current.settings.theme).toBe('night');
        act(() => media.setMatches(false));
        expect(result.current.settings.theme).toBe('default');
        expect(localStorage.getItem('theme')).toBe('default');
    });
});
