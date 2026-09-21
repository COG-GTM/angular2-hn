import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { SettingsProvider } from './SettingsProvider';
import { useSettings } from './useSettings';
import { mockMatchMedia } from '../test/utils';

function Probe() {
    const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();

    return (
        <div>
            <span data-testid="state">{JSON.stringify(settings)}</span>
            <button onClick={toggleSettings}>toggle-settings</button>
            <button onClick={toggleOpenLinksInNewTab}>toggle-new-tab</button>
            <button onClick={() => setTheme('amoledblack')}>set-theme</button>
            <button onClick={() => setFont('22')}>set-font</button>
            <button onClick={() => setSpacing('8')}>set-spacing</button>
        </div>
    );
}

function state() {
    return JSON.parse(screen.getByTestId('state').textContent ?? '{}');
}

beforeEach(() => {
    localStorage.clear();
});

describe('SettingsProvider', () => {
    it('falls back to defaults when nothing is stored', () => {
        mockMatchMedia(false);
        render(
            <SettingsProvider>
                <Probe />
            </SettingsProvider>
        );

        expect(state()).toEqual({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
    });

    it('reads persisted settings from localStorage', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '5');
        localStorage.setItem('theme', 'night');
        mockMatchMedia(false);

        render(
            <SettingsProvider>
                <Probe />
            </SettingsProvider>
        );

        expect(state()).toMatchObject({
            openLinkInNewTab: true,
            titleFontSize: '20',
            listSpacing: '5',
            theme: 'night',
        });
    });

    it('uses the night theme when the system prefers dark and nothing is saved', () => {
        mockMatchMedia(true);

        render(
            <SettingsProvider>
                <Probe />
            </SettingsProvider>
        );

        expect(state().theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');
    });

    it('reacts to system color scheme changes', () => {
        const matchMedia = mockMatchMedia(false);

        render(
            <SettingsProvider>
                <Probe />
            </SettingsProvider>
        );

        act(() => matchMedia.emit(true));
        expect(state().theme).toBe('night');

        act(() => matchMedia.emit(false));
        expect(state().theme).toBe('default');
    });

    it('unsubscribes from the media query on unmount', () => {
        const matchMedia = mockMatchMedia(false);

        const { unmount } = render(
            <SettingsProvider>
                <Probe />
            </SettingsProvider>
        );
        unmount();

        expect(matchMedia.listenerCount()).toBe(0);
    });

    it('toggles settings visibility without persisting it', async () => {
        mockMatchMedia(false);
        render(
            <SettingsProvider>
                <Probe />
            </SettingsProvider>
        );

        await userEvent.click(screen.getByText('toggle-settings'));

        expect(state().showSettings).toBe(true);
        expect(localStorage.getItem('showSettings')).toBeNull();
    });

    it('persists open-links-in-new-tab, theme, font size and list spacing', async () => {
        mockMatchMedia(false);
        render(
            <SettingsProvider>
                <Probe />
            </SettingsProvider>
        );

        await userEvent.click(screen.getByText('toggle-new-tab'));
        await userEvent.click(screen.getByText('set-theme'));
        await userEvent.click(screen.getByText('set-font'));
        await userEvent.click(screen.getByText('set-spacing'));

        expect(state()).toMatchObject({
            openLinkInNewTab: true,
            theme: 'amoledblack',
            titleFontSize: '22',
            listSpacing: '8',
        });
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
        expect(localStorage.getItem('theme')).toBe('amoledblack');
        expect(localStorage.getItem('titleFontSize')).toBe('22');
        expect(localStorage.getItem('listSpacing')).toBe('8');
    });
});

describe('useSettings', () => {
    it('throws when used outside of a provider', () => {
        expect(() => render(<Probe />)).toThrow(/SettingsProvider/);
    });
});
