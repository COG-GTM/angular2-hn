import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SettingsProvider } from './SettingsContext';
import { useSettings } from './settingsContext';
import { installMatchMedia } from '../test/matchMedia';

const wrapper = ({ children }: { children: React.ReactNode }) => <SettingsProvider>{children}</SettingsProvider>;

describe('SettingsProvider', () => {
    it('starts from the documented defaults', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });

        expect(result.current.settings).toEqual({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
    });

    it('restores persisted settings from localStorage', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('theme', 'amoledblack');
        localStorage.setItem('titleFontSize', '22');
        localStorage.setItem('listSpacing', '8');

        const { result } = renderHook(() => useSettings(), { wrapper });

        expect(result.current.settings).toEqual({
            showSettings: false,
            openLinkInNewTab: true,
            theme: 'amoledblack',
            titleFontSize: '22',
            listSpacing: '8',
        });
    });

    it('falls back to the night theme when the system prefers dark and nothing is stored', () => {
        installMatchMedia(true);

        const { result } = renderHook(() => useSettings(), { wrapper });

        expect(result.current.settings.theme).toBe('night');
    });

    it('keeps a stored theme even when the system prefers dark', () => {
        installMatchMedia(true);
        localStorage.setItem('theme', 'default');

        const { result } = renderHook(() => useSettings(), { wrapper });

        expect(result.current.settings.theme).toBe('default');
    });

    it('follows later system colour scheme changes and persists them', () => {
        const media = installMatchMedia(false);
        const { result } = renderHook(() => useSettings(), { wrapper });

        act(() => media.emitChange(true));
        expect(result.current.settings.theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');

        act(() => media.emitChange(false));
        expect(result.current.settings.theme).toBe('default');
        expect(localStorage.getItem('theme')).toBe('default');
    });

    it('unsubscribes from colour scheme changes on unmount', () => {
        const media = installMatchMedia(false);
        const { unmount } = renderHook(() => useSettings(), { wrapper });

        expect(media.listenerCount()).toBe(1);
        unmount();
        expect(media.listenerCount()).toBe(0);
    });

    it('toggles the settings panel without persisting it', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });

        act(() => result.current.toggleSettings());
        expect(result.current.settings.showSettings).toBe(true);
        expect(localStorage.getItem('showSettings')).toBeNull();

        act(() => result.current.toggleSettings());
        expect(result.current.settings.showSettings).toBe(false);
    });

    it('persists the remaining preferences', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });

        act(() => result.current.toggleOpenLinksInNewTab());
        expect(result.current.settings.openLinkInNewTab).toBe(true);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');

        act(() => result.current.setTheme('night'));
        expect(result.current.settings.theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');

        act(() => result.current.setFont('20'));
        expect(result.current.settings.titleFontSize).toBe('20');
        expect(localStorage.getItem('titleFontSize')).toBe('20');

        act(() => result.current.setSpacing('5'));
        expect(result.current.settings.listSpacing).toBe('5');
        expect(localStorage.getItem('listSpacing')).toBe('5');
    });

    it('shares one settings object between consumers', async () => {
        function Toggle() {
            const { settings, toggleOpenLinksInNewTab } = useSettings();

            return <button onClick={toggleOpenLinksInNewTab}>new tab: {String(settings.openLinkInNewTab)}</button>;
        }

        function Readout() {
            const { settings } = useSettings();

            return <span data-testid="readout">{String(settings.openLinkInNewTab)}</span>;
        }

        render(
            <SettingsProvider>
                <Toggle />
                <Readout />
            </SettingsProvider>
        );

        await userEvent.click(screen.getByRole('button'));

        expect(screen.getByTestId('readout')).toHaveTextContent('true');
    });
});

describe('useSettings', () => {
    it('throws when used outside of a provider', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => renderHook(() => useSettings())).toThrow('useSettings must be used within a SettingsProvider');

        consoleError.mockRestore();
    });
});
