import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsProvider } from './SettingsProvider';
import { useSettings } from './settingsContext';

type Listener = (event: MediaQueryListEvent) => void;

let listeners: Listener[] = [];
let systemPrefersDark = false;

function mockMatchMedia() {
    listeners = [];
    vi.stubGlobal('matchMedia', (query: string) => ({
        media: query,
        get matches() {
            return systemPrefersDark;
        },
        addEventListener: (_: string, listener: Listener) => listeners.push(listener),
        removeEventListener: (_: string, listener: Listener) => {
            listeners = listeners.filter((entry) => entry !== listener);
        },
    }));
}

function Probe() {
    const { settings, setTheme, setFont, setSpacing, toggleOpenLinksInNewTab, toggleSettings } = useSettings();
    return (
        <div>
            <span data-testid="theme">{settings.theme}</span>
            <span data-testid="font">{settings.titleFontSize}</span>
            <span data-testid="spacing">{settings.listSpacing}</span>
            <span data-testid="new-tab">{String(settings.openLinkInNewTab)}</span>
            <span data-testid="show-settings">{String(settings.showSettings)}</span>
            <button onClick={() => setTheme('amoledblack')}>theme</button>
            <button onClick={() => setFont('20')}>font</button>
            <button onClick={() => setSpacing('5')}>spacing</button>
            <button onClick={toggleOpenLinksInNewTab}>new tab</button>
            <button onClick={toggleSettings}>settings</button>
        </div>
    );
}

describe('SettingsProvider', () => {
    beforeEach(() => {
        localStorage.clear();
        systemPrefersDark = false;
        mockMatchMedia();
    });

    it('persists settings changes to localStorage', async () => {
        const user = userEvent.setup();
        render(
            <SettingsProvider>
                <Probe />
            </SettingsProvider>
        );

        await user.click(screen.getByText('theme'));
        await user.click(screen.getByText('font'));
        await user.click(screen.getByText('spacing'));
        await user.click(screen.getByText('new tab'));
        await user.click(screen.getByText('settings'));

        expect(screen.getByTestId('theme')).toHaveTextContent('amoledblack');
        expect(screen.getByTestId('font')).toHaveTextContent('20');
        expect(screen.getByTestId('spacing')).toHaveTextContent('5');
        expect(screen.getByTestId('new-tab')).toHaveTextContent('true');
        expect(screen.getByTestId('show-settings')).toHaveTextContent('true');
        expect(localStorage.getItem('theme')).toBe('amoledblack');
        expect(localStorage.getItem('titleFontSize')).toBe('20');
        expect(localStorage.getItem('listSpacing')).toBe('5');
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('restores the saved theme instead of the system preference', () => {
        localStorage.setItem('theme', 'night');
        render(
            <SettingsProvider>
                <Probe />
            </SettingsProvider>
        );
        expect(screen.getByTestId('theme')).toHaveTextContent('night');
    });

    it('follows the system colour scheme when no theme is saved', () => {
        systemPrefersDark = true;
        render(
            <SettingsProvider>
                <Probe />
            </SettingsProvider>
        );
        expect(screen.getByTestId('theme')).toHaveTextContent('night');

        act(() => {
            listeners.forEach((listener) => listener({ matches: false } as MediaQueryListEvent));
        });
        expect(screen.getByTestId('theme')).toHaveTextContent('default');
    });
});
