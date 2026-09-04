import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { SettingsProvider, useSettings } from './SettingsContext';

function Probe() {
    const { settings, setTheme, setFont, setSpacing, toggleOpenLinksInNewTab, toggleSettings } = useSettings();
    return (
        <div>
            <span data-testid="state">
                {settings.theme}|{settings.titleFontSize}|{settings.listSpacing}|
                {String(settings.openLinkInNewTab)}|{String(settings.showSettings)}
            </span>
            <button onClick={() => setTheme('night')}>theme</button>
            <button onClick={() => setFont('20')}>font</button>
            <button onClick={() => setSpacing('5')}>spacing</button>
            <button onClick={toggleOpenLinksInNewTab}>links</button>
            <button onClick={toggleSettings}>settings</button>
        </div>
    );
}

beforeEach(() => {
    localStorage.clear();
});

describe('SettingsProvider', () => {
    it('exposes defaults', () => {
        render(
            <SettingsProvider>
                <Probe />
            </SettingsProvider>
        );

        expect(screen.getByTestId('state')).toHaveTextContent('default|16|0|false|false');
    });

    it('persists each setting to localStorage', async () => {
        render(
            <SettingsProvider>
                <Probe />
            </SettingsProvider>
        );

        await userEvent.click(screen.getByText('theme'));
        await userEvent.click(screen.getByText('font'));
        await userEvent.click(screen.getByText('spacing'));
        await userEvent.click(screen.getByText('links'));
        await userEvent.click(screen.getByText('settings'));

        expect(screen.getByTestId('state')).toHaveTextContent('night|20|5|true|true');
        expect(localStorage.getItem('theme')).toBe('night');
        expect(localStorage.getItem('titleFontSize')).toBe('20');
        expect(localStorage.getItem('listSpacing')).toBe('5');
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('restores persisted settings', () => {
        localStorage.setItem('theme', 'amoledblack');
        localStorage.setItem('titleFontSize', '18');

        render(
            <SettingsProvider>
                <Probe />
            </SettingsProvider>
        );

        expect(screen.getByTestId('state')).toHaveTextContent('amoledblack|18|0|false|false');
    });

    it('falls back to the system colour scheme when no theme is stored', () => {
        act(() => {
            window.matchMedia = ((query: string) =>
                ({
                    matches: true,
                    media: query,
                    addEventListener: () => {},
                    removeEventListener: () => {},
                }) as unknown as MediaQueryList) as typeof window.matchMedia;
        });

        render(
            <SettingsProvider>
                <Probe />
            </SettingsProvider>
        );

        expect(screen.getByTestId('state')).toHaveTextContent('night|');
    });
});
