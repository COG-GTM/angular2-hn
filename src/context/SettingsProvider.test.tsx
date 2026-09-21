import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsProvider } from './SettingsProvider';
import { useSettings } from './useSettings';

type MediaListener = (event: MediaQueryListEvent) => void;

let listeners: MediaListener[] = [];
let prefersDark = false;

function stubMatchMedia() {
    vi.stubGlobal(
        'matchMedia',
        vi.fn((media: string) => ({
            media,
            matches: prefersDark,
            addEventListener: (_: string, listener: MediaListener) => listeners.push(listener),
            removeEventListener: (_: string, listener: MediaListener) => {
                listeners = listeners.filter((entry) => entry !== listener);
            },
        }))
    );
}

function Probe() {
    const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();

    return (
        <div>
            <span data-testid="state">{JSON.stringify(settings)}</span>
            <button onClick={toggleSettings}>toggle-settings</button>
            <button onClick={toggleOpenLinksInNewTab}>toggle-new-tab</button>
            <button onClick={() => setTheme('dusk')}>set-theme</button>
            <button onClick={() => setFont('18')}>set-font</button>
            <button onClick={() => setSpacing('12')}>set-spacing</button>
        </div>
    );
}

function state() {
    return JSON.parse(screen.getByTestId('state').textContent as string);
}

beforeEach(() => {
    listeners = [];
    prefersDark = false;
    localStorage.clear();
    stubMatchMedia();
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('SettingsProvider', () => {
    it('uses defaults and the light system color scheme', () => {
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
        expect(localStorage.getItem('theme')).toBe('default');
    });

    it('applies the dark system color scheme when no theme is stored', () => {
        prefersDark = true;

        render(
            <SettingsProvider>
                <Probe />
            </SettingsProvider>
        );

        expect(state().theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');
    });

    it('restores persisted settings', () => {
        localStorage.setItem('theme', 'dusk');
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '8');
        localStorage.setItem('openLinkInNewTab', 'true');

        render(
            <SettingsProvider>
                <Probe />
            </SettingsProvider>
        );

        expect(state()).toEqual({
            showSettings: false,
            openLinkInNewTab: true,
            theme: 'dusk',
            titleFontSize: '20',
            listSpacing: '8',
        });
    });

    it('reacts to system color scheme changes', () => {
        render(
            <SettingsProvider>
                <Probe />
            </SettingsProvider>
        );

        act(() => listeners.forEach((listener) => listener({ matches: true } as MediaQueryListEvent)));
        expect(state().theme).toBe('night');

        act(() => listeners.forEach((listener) => listener({ matches: false } as MediaQueryListEvent)));
        expect(state().theme).toBe('default');
    });

    it('removes the color scheme listener on unmount', () => {
        const { unmount } = render(
            <SettingsProvider>
                <Probe />
            </SettingsProvider>
        );

        unmount();

        expect(listeners).toHaveLength(0);
    });

    it('toggles and persists settings', async () => {
        const user = userEvent.setup();

        render(
            <SettingsProvider>
                <Probe />
            </SettingsProvider>
        );

        await user.click(screen.getByText('toggle-settings'));
        expect(state().showSettings).toBe(true);

        await user.click(screen.getByText('toggle-new-tab'));
        expect(state().openLinkInNewTab).toBe(true);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');

        await user.click(screen.getByText('set-theme'));
        expect(state().theme).toBe('dusk');
        expect(localStorage.getItem('theme')).toBe('dusk');

        await user.click(screen.getByText('set-font'));
        expect(state().titleFontSize).toBe('18');
        expect(localStorage.getItem('titleFontSize')).toBe('18');

        await user.click(screen.getByText('set-spacing'));
        expect(state().listSpacing).toBe('12');
        expect(localStorage.getItem('listSpacing')).toBe('12');
    });
});

describe('useSettings', () => {
    it('throws outside of a provider', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => render(<Probe />)).toThrow('useSettings must be used within a SettingsProvider');

        consoleError.mockRestore();
    });
});
