import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SettingsProvider, useSettings } from './SettingsContext';
import { stubMatchMedia } from '../testUtils/matchMedia';

function Consumer() {
    const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();

    return (
        <div>
            <span data-testid="state">{JSON.stringify(settings)}</span>
            <button onClick={toggleSettings}>toggle settings</button>
            <button onClick={toggleOpenLinksInNewTab}>toggle new tab</button>
            <button onClick={() => setTheme('amoledblack')}>set theme</button>
            <button onClick={() => setFont('22')}>set font</button>
            <button onClick={() => setSpacing('5')}>set spacing</button>
        </div>
    );
}

function renderWithProvider(children: ReactNode = <Consumer />) {
    return render(<SettingsProvider>{children}</SettingsProvider>);
}

function currentSettings() {
    return JSON.parse(screen.getByTestId('state').textContent ?? '{}');
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('SettingsProvider', () => {
    it('starts from the default settings', () => {
        stubMatchMedia(false);
        renderWithProvider();

        expect(currentSettings()).toEqual({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
    });

    it('hydrates the settings from localStorage', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '3');
        localStorage.setItem('theme', 'amoledblack');
        stubMatchMedia(true);

        renderWithProvider();

        expect(currentSettings()).toEqual({
            showSettings: false,
            openLinkInNewTab: true,
            theme: 'amoledblack',
            titleFontSize: '20',
            listSpacing: '3',
        });
    });

    it('toggles the settings modal without persisting it', async () => {
        stubMatchMedia(false);
        renderWithProvider();

        await userEvent.click(screen.getByText('toggle settings'));
        expect(currentSettings().showSettings).toBe(true);

        await userEvent.click(screen.getByText('toggle settings'));
        expect(currentSettings().showSettings).toBe(false);
        expect(localStorage.getItem('showSettings')).toBeNull();
    });

    it('persists the open-links-in-new-tab preference', async () => {
        stubMatchMedia(false);
        renderWithProvider();

        await userEvent.click(screen.getByText('toggle new tab'));

        expect(currentSettings().openLinkInNewTab).toBe(true);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('persists theme, font size and list spacing', async () => {
        stubMatchMedia(false);
        renderWithProvider();

        await userEvent.click(screen.getByText('set theme'));
        await userEvent.click(screen.getByText('set font'));
        await userEvent.click(screen.getByText('set spacing'));

        expect(currentSettings()).toMatchObject({ theme: 'amoledblack', titleFontSize: '22', listSpacing: '5' });
        expect(localStorage.getItem('theme')).toBe('amoledblack');
        expect(localStorage.getItem('titleFontSize')).toBe('22');
        expect(localStorage.getItem('listSpacing')).toBe('5');
    });

    it('defaults to the night theme when the system prefers a dark color scheme', () => {
        stubMatchMedia(true);

        renderWithProvider();

        expect(currentSettings().theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');
    });

    it('keeps a saved theme instead of following the system color scheme on start-up', () => {
        localStorage.setItem('theme', 'amoledblack');
        stubMatchMedia(true);

        renderWithProvider();

        expect(currentSettings().theme).toBe('amoledblack');
    });

    it('follows later system color scheme changes', () => {
        const media = stubMatchMedia(false);
        renderWithProvider();

        expect(currentSettings().theme).toBe('default');

        act(() => media.setMatches(true));
        expect(currentSettings().theme).toBe('night');

        act(() => media.setMatches(false));
        expect(currentSettings().theme).toBe('default');
    });

    it('unsubscribes from the color scheme media query on unmount', () => {
        const media = stubMatchMedia(false);
        const { unmount } = renderWithProvider();

        expect(media.listenerCount()).toBe(1);
        unmount();
        expect(media.listenerCount()).toBe(0);
    });

    it('works when matchMedia is unavailable', () => {
        vi.stubGlobal('matchMedia', undefined);

        renderWithProvider();

        expect(currentSettings().theme).toBe('default');
    });
});

describe('useSettings', () => {
    it('throws when used outside of a provider', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        expect(() => render(<Consumer />)).toThrow(/useSettings must be used within a SettingsProvider/);

        consoleError.mockRestore();
    });
});
