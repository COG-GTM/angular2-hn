import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsProvider, useSettings } from './SettingsContext';
import { mockMatchMedia } from '../test/setup';

function SettingsProbe() {
    const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();

    return (
        <div>
            <span data-testid="state">{JSON.stringify(settings)}</span>
            <button onClick={toggleSettings}>toggle settings</button>
            <button onClick={toggleOpenLinksInNewTab}>toggle new tab</button>
            <button onClick={() => setTheme('amoledblack')}>set theme</button>
            <button onClick={() => setFont('20')}>set font</button>
            <button onClick={() => setSpacing('12')}>set spacing</button>
        </div>
    );
}

function renderProbe() {
    render(
        <SettingsProvider>
            <SettingsProbe />
        </SettingsProvider>
    );
    return () => JSON.parse(screen.getByTestId('state').textContent ?? '{}');
}

describe('SettingsContext', () => {
    it('uses defaults when nothing is persisted', () => {
        const state = renderProbe();

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
        localStorage.setItem('theme', 'night');
        localStorage.setItem('titleFontSize', '22');
        localStorage.setItem('listSpacing', '8');

        const state = renderProbe();

        expect(state()).toMatchObject({
            openLinkInNewTab: true,
            theme: 'night',
            titleFontSize: '22',
            listSpacing: '8',
        });
    });

    it('toggles the settings popup without persisting it', async () => {
        const state = renderProbe();

        await userEvent.click(screen.getByRole('button', { name: 'toggle settings' }));

        expect(state().showSettings).toBe(true);
        expect(localStorage.getItem('showSettings')).toBeNull();
    });

    it('persists each setter', async () => {
        const state = renderProbe();

        await userEvent.click(screen.getByRole('button', { name: 'toggle new tab' }));
        await userEvent.click(screen.getByRole('button', { name: 'set theme' }));
        await userEvent.click(screen.getByRole('button', { name: 'set font' }));
        await userEvent.click(screen.getByRole('button', { name: 'set spacing' }));

        expect(state()).toMatchObject({
            openLinkInNewTab: true,
            theme: 'amoledblack',
            titleFontSize: '20',
            listSpacing: '12',
        });
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
        expect(localStorage.getItem('theme')).toBe('amoledblack');
        expect(localStorage.getItem('titleFontSize')).toBe('20');
        expect(localStorage.getItem('listSpacing')).toBe('12');
    });

    it('uses the night theme when the system prefers a dark color scheme', () => {
        mockMatchMedia(true);

        const state = renderProbe();

        expect(state().theme).toBe('night');
    });

    it('follows later system color scheme changes', () => {
        const media = mockMatchMedia(false);
        const state = renderProbe();

        act(() => {
            media.dispatchEvent({ matches: true } as MediaQueryListEvent);
        });

        expect(state().theme).toBe('night');
    });

    it('keeps a saved theme instead of the system color scheme', () => {
        localStorage.setItem('theme', 'amoledblack');
        mockMatchMedia(true);

        const state = renderProbe();

        expect(state().theme).toBe('amoledblack');
    });
});
