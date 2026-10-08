import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import { SettingsProvider } from '../context/SettingsProvider';
import { useSettings } from '../hooks/useSettings';
import { loadSettings } from './settings';

const wrapper = ({ children }: { children: ReactNode }) => <SettingsProvider>{children}</SettingsProvider>;

describe('settings', () => {
    it('uses the Angular defaults', () => {
        expect(loadSettings()).toEqual({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
    });

    it('reads values saved by the Angular app', () => {
        localStorage.setItem('theme', 'amoledblack');
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '5');
        expect(loadSettings()).toMatchObject({
            theme: 'amoledblack',
            openLinkInNewTab: true,
            titleFontSize: '20',
            listSpacing: '5',
        });
    });

    it('persists changes to localStorage', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        act(() => {
            result.current.setTheme('night');
            result.current.toggleOpenLinksInNewTab();
            result.current.setFont('18');
            result.current.setSpacing('4');
            result.current.toggleSettings();
        });
        expect(result.current.settings).toMatchObject({
            theme: 'night',
            openLinkInNewTab: true,
            titleFontSize: '18',
            listSpacing: '4',
            showSettings: true,
        });
        expect(localStorage.getItem('theme')).toBe('night');
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
        expect(localStorage.getItem('titleFontSize')).toBe('18');
        expect(localStorage.getItem('listSpacing')).toBe('4');
        expect(localStorage.getItem('showSettings')).toBeNull();
    });

    it('throws outside the provider', () => {
        expect(() => renderHook(() => useSettings())).toThrow(/SettingsProvider/);
    });
});
