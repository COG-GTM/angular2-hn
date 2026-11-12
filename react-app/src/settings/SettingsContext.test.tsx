import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import { SettingsProvider, useSettings } from './SettingsContext';

const wrapper = ({ children }: { children: ReactNode }) => <SettingsProvider>{children}</SettingsProvider>;

function mockColorScheme(dark: boolean) {
    vi.spyOn(window, 'matchMedia').mockImplementation(
        (query: string) =>
            ({
                matches: dark,
                media: query,
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            }) as unknown as MediaQueryList
    );
}

describe('SettingsContext', () => {
    it('uses the Angular defaults', () => {
        const { result } = renderHook(useSettings, { wrapper });
        expect(result.current.settings).toEqual({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
        expect(document.documentElement).toHaveClass('default');
        expect(localStorage.getItem('theme')).toBe('default');
    });

    it('picks night when the system prefers dark and no theme is saved', () => {
        mockColorScheme(true);
        const { result } = renderHook(useSettings, { wrapper });
        expect(result.current.settings.theme).toBe('night');
        expect(document.documentElement).toHaveClass('night');
    });

    it('restores saved settings from localStorage', () => {
        mockColorScheme(true);
        localStorage.setItem('theme', 'amoledblack');
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '8');
        const { result } = renderHook(useSettings, { wrapper });
        expect(result.current.settings).toMatchObject({
            theme: 'amoledblack',
            openLinkInNewTab: true,
            titleFontSize: '20',
            listSpacing: '8',
        });
    });

    it('persists changes and swaps the root theme class', () => {
        const { result } = renderHook(useSettings, { wrapper });
        act(() => result.current.setTheme('night'));
        act(() => result.current.toggleOpenLinksInNewTab());
        act(() => result.current.setFont('18'));
        act(() => result.current.setSpacing('4'));
        act(() => result.current.toggleSettings());

        expect(document.documentElement).toHaveClass('night');
        expect(document.documentElement).not.toHaveClass('default');
        expect(localStorage.getItem('theme')).toBe('night');
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
        expect(localStorage.getItem('titleFontSize')).toBe('18');
        expect(localStorage.getItem('listSpacing')).toBe('4');
        expect(result.current.settings.showSettings).toBe(true);
    });
});
