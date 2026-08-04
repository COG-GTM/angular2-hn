import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SettingsProvider, useSettings, type SettingsContextValue } from './settings-context';

type ChangeListener = (event: MediaQueryListEvent) => void;

interface MediaStub {
    matches: boolean;
    listeners: ChangeListener[];
    emit: (matches: boolean) => void;
}

function stubMatchMedia(matches: boolean): MediaStub {
    const stub: MediaStub = {
        matches,
        listeners: [],
        emit: (nextMatches: boolean) => {
            stub.matches = nextMatches;
            stub.listeners.forEach((listener) =>
                listener({ matches: nextMatches, media: '(prefers-color-scheme: dark)' } as MediaQueryListEvent)
            );
        },
    };

    window.matchMedia = ((media: string) =>
        ({
            media,
            get matches() {
                return stub.matches;
            },
            addEventListener: (_type: string, listener: ChangeListener) => stub.listeners.push(listener),
            removeEventListener: (_type: string, listener: ChangeListener) => {
                stub.listeners = stub.listeners.filter((registered) => registered !== listener);
            },
        }) as unknown as MediaQueryList) as typeof window.matchMedia;

    return stub;
}

function Probe() {
    const { showSettings, openLinkInNewTab, theme, titleFontSize, listSpacing, ...actions } = useSettings();

    return (
        <div>
            <span data-testid="state">
                {JSON.stringify({ showSettings, openLinkInNewTab, theme, titleFontSize, listSpacing })}
            </span>
            <button onClick={actions.toggleSettings}>toggle-settings</button>
            <button onClick={actions.toggleOpenLinksInNewTab}>toggle-new-tab</button>
            <button onClick={() => actions.setTheme('night')}>set-theme</button>
            <button onClick={() => actions.setFont('20')}>set-font</button>
            <button onClick={() => actions.setSpacing('10')}>set-spacing</button>
        </div>
    );
}

function currentState() {
    return JSON.parse(screen.getByTestId('state').textContent ?? '{}');
}

function renderProbe() {
    return render(
        <SettingsProvider>
            <Probe />
        </SettingsProvider>
    );
}

beforeEach(() => {
    localStorage.clear();
    stubMatchMedia(false);
});

describe('SettingsProvider', () => {
    it('uses the default settings when nothing is persisted', () => {
        renderProbe();

        expect(currentState()).toEqual({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
    });

    it('reads the initial state from localStorage', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('theme', 'night');
        localStorage.setItem('titleFontSize', '22');
        localStorage.setItem('listSpacing', '8');

        renderProbe();

        expect(currentState()).toEqual({
            showSettings: false,
            openLinkInNewTab: true,
            theme: 'night',
            titleFontSize: '22',
            listSpacing: '8',
        });
    });

    it('falls back to the system color scheme when no theme is persisted', () => {
        stubMatchMedia(true);

        renderProbe();

        expect(currentState().theme).toBe('night');
        expect(localStorage.getItem('theme')).toBeNull();
    });

    it('toggles the settings dialog without persisting it', async () => {
        const user = userEvent.setup();
        renderProbe();

        await user.click(screen.getByText('toggle-settings'));

        expect(currentState().showSettings).toBe(true);
        expect(localStorage.getItem('showSettings')).toBeNull();
    });

    it('toggles opening links in a new tab and persists it', async () => {
        const user = userEvent.setup();
        renderProbe();

        await user.click(screen.getByText('toggle-new-tab'));

        expect(currentState().openLinkInNewTab).toBe(true);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');

        await user.click(screen.getByText('toggle-new-tab'));

        expect(currentState().openLinkInNewTab).toBe(false);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
    });

    it('persists the theme, font size and list spacing', async () => {
        const user = userEvent.setup();
        renderProbe();

        await user.click(screen.getByText('set-theme'));
        await user.click(screen.getByText('set-font'));
        await user.click(screen.getByText('set-spacing'));

        expect(currentState()).toMatchObject({ theme: 'night', titleFontSize: '20', listSpacing: '10' });
        expect(localStorage.getItem('theme')).toBe('night');
        expect(localStorage.getItem('titleFontSize')).toBe('20');
        expect(localStorage.getItem('listSpacing')).toBe('10');
    });

    it('switches the theme when the system color scheme changes', () => {
        const media = stubMatchMedia(false);
        renderProbe();

        act(() => media.emit(true));
        expect(currentState().theme).toBe('night');

        act(() => media.emit(false));
        expect(currentState().theme).toBe('default');
    });

    it('removes the color scheme listener on unmount', () => {
        const media = stubMatchMedia(false);
        const { unmount } = renderProbe();

        expect(media.listeners).toHaveLength(1);
        unmount();
        expect(media.listeners).toHaveLength(0);
    });

    it('re-renders every consumer with the new value instead of mutating a shared object', async () => {
        const user = userEvent.setup();
        const renderedThemes: string[] = [];
        const seenValues: SettingsContextValue[] = [];

        function ThemeConsumer() {
            const settings = useSettings();
            renderedThemes.push(settings.theme);
            seenValues.push(settings);

            return <span data-testid="consumer-theme">{settings.theme}</span>;
        }

        render(
            <SettingsProvider>
                <Probe />
                <ThemeConsumer />
            </SettingsProvider>
        );

        expect(screen.getByTestId('consumer-theme')).toHaveTextContent('default');

        await user.click(screen.getByText('set-theme'));

        expect(screen.getByTestId('consumer-theme')).toHaveTextContent('night');
        expect(renderedThemes).toEqual(['default', 'night']);
        expect(seenValues[0]).not.toBe(seenValues[1]);
        expect(seenValues[0].theme).toBe('default');
    });

    it('throws when useSettings is used outside of the provider', () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => render(<Probe />)).toThrow('useSettings must be used within a SettingsProvider');

        consoleError.mockRestore();
    });
});
