import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsProvider, useSettings } from './SettingsContext';

type ChangeListener = (event: MediaQueryListEvent) => void;

function stubMatchMedia(matches: boolean) {
    const listeners = new Set<ChangeListener>();
    const media = {
        matches,
        media: '(prefers-color-scheme: dark)',
        addEventListener: vi.fn((_: string, listener: ChangeListener) => listeners.add(listener)),
        removeEventListener: vi.fn((_: string, listener: ChangeListener) => listeners.delete(listener)),
    };

    vi.stubGlobal(
        'matchMedia',
        vi.fn(() => media)
    );

    return {
        media,
        emitChange(nextMatches: boolean) {
            act(() => {
                listeners.forEach((listener) => listener({ matches: nextMatches } as MediaQueryListEvent));
            });
        },
    };
}

function SettingsProbe() {
    const { settings, setTheme, setFont, setSpacing, toggleOpenLinksInNewTab, toggleSettings } = useSettings();

    return (
        <div>
            <span data-testid="theme">{settings.theme}</span>
            <span data-testid="titleFontSize">{settings.titleFontSize}</span>
            <span data-testid="listSpacing">{settings.listSpacing}</span>
            <span data-testid="openLinkInNewTab">{String(settings.openLinkInNewTab)}</span>
            <span data-testid="showSettings">{String(settings.showSettings)}</span>
            <button onClick={() => setTheme('amoledblack')}>set theme</button>
            <button onClick={() => setFont('20')}>set font</button>
            <button onClick={() => setSpacing('5')}>set spacing</button>
            <button onClick={toggleOpenLinksInNewTab}>toggle new tab</button>
            <button onClick={toggleSettings}>toggle settings</button>
        </div>
    );
}

function renderSettings() {
    return render(
        <SettingsProvider>
            <SettingsProbe />
        </SettingsProvider>
    );
}

describe('SettingsProvider', () => {
    beforeEach(() => {
        localStorage.clear();
        stubMatchMedia(false);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('falls back to the Angular service defaults when localStorage is empty', () => {
        renderSettings();

        expect(screen.getByTestId('theme')).toHaveTextContent('default');
        expect(screen.getByTestId('titleFontSize')).toHaveTextContent('16');
        expect(screen.getByTestId('listSpacing')).toHaveTextContent('0');
        expect(screen.getByTestId('openLinkInNewTab')).toHaveTextContent('false');
        expect(screen.getByTestId('showSettings')).toHaveTextContent('false');
    });

    it('reads persisted settings from localStorage', () => {
        localStorage.setItem('theme', 'night');
        localStorage.setItem('titleFontSize', '22');
        localStorage.setItem('listSpacing', '8');
        localStorage.setItem('openLinkInNewTab', 'true');

        renderSettings();

        expect(screen.getByTestId('theme')).toHaveTextContent('night');
        expect(screen.getByTestId('titleFontSize')).toHaveTextContent('22');
        expect(screen.getByTestId('listSpacing')).toHaveTextContent('8');
        expect(screen.getByTestId('openLinkInNewTab')).toHaveTextContent('true');
    });

    it('resolves the initial theme from the system preference when nothing is saved', () => {
        vi.unstubAllGlobals();
        stubMatchMedia(true);

        renderSettings();

        expect(screen.getByTestId('theme')).toHaveTextContent('night');
        expect(localStorage.getItem('theme')).toBe('night');
    });

    it('keeps the saved theme even when the system prefers dark', () => {
        vi.unstubAllGlobals();
        stubMatchMedia(true);
        localStorage.setItem('theme', 'default');

        renderSettings();

        expect(screen.getByTestId('theme')).toHaveTextContent('default');
    });

    it('updates the theme when the system colour scheme changes', () => {
        vi.unstubAllGlobals();
        const { emitChange } = stubMatchMedia(false);
        renderSettings();

        emitChange(true);
        expect(screen.getByTestId('theme')).toHaveTextContent('night');
        expect(localStorage.getItem('theme')).toBe('night');

        emitChange(false);
        expect(screen.getByTestId('theme')).toHaveTextContent('default');
        expect(localStorage.getItem('theme')).toBe('default');
    });

    it('removes the media query listener on unmount', () => {
        vi.unstubAllGlobals();
        const { media } = stubMatchMedia(false);

        renderSettings().unmount();

        expect(media.removeEventListener).toHaveBeenCalledWith('change', media.addEventListener.mock.calls[0][1]);
    });

    it('persists the theme through setTheme', async () => {
        renderSettings();

        await userEvent.click(screen.getByRole('button', { name: 'set theme' }));

        expect(screen.getByTestId('theme')).toHaveTextContent('amoledblack');
        expect(localStorage.getItem('theme')).toBe('amoledblack');
    });

    it('persists the title font size through setFont', async () => {
        renderSettings();

        await userEvent.click(screen.getByRole('button', { name: 'set font' }));

        expect(screen.getByTestId('titleFontSize')).toHaveTextContent('20');
        expect(localStorage.getItem('titleFontSize')).toBe('20');
    });

    it('persists the list spacing through setSpacing', async () => {
        renderSettings();

        await userEvent.click(screen.getByRole('button', { name: 'set spacing' }));

        expect(screen.getByTestId('listSpacing')).toHaveTextContent('5');
        expect(localStorage.getItem('listSpacing')).toBe('5');
    });

    it('persists the open-in-new-tab preference through toggleOpenLinksInNewTab', async () => {
        renderSettings();

        await userEvent.click(screen.getByRole('button', { name: 'toggle new tab' }));

        expect(screen.getByTestId('openLinkInNewTab')).toHaveTextContent('true');
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');

        await userEvent.click(screen.getByRole('button', { name: 'toggle new tab' }));

        expect(screen.getByTestId('openLinkInNewTab')).toHaveTextContent('false');
        expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
    });

    it('toggles the settings panel without persisting it', async () => {
        renderSettings();

        await userEvent.click(screen.getByRole('button', { name: 'toggle settings' }));

        expect(screen.getByTestId('showSettings')).toHaveTextContent('true');
        expect(localStorage.getItem('showSettings')).toBeNull();
    });
});

describe('useSettings', () => {
    it('throws when used outside of a SettingsProvider', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => render(<SettingsProbe />)).toThrow('useSettings must be used within a SettingsProvider');

        consoleError.mockRestore();
    });
});
