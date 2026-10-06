import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { mockMatchMedia, type MatchMediaMock } from '../../test/matchMedia';
import { SettingsProvider } from './SettingsProvider';
import { useSettings } from './useSettings';

function Consumer() {
    const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();
    return (
        <div>
            <output data-testid="settings">{JSON.stringify(settings)}</output>
            <button onClick={toggleSettings}>toggle settings</button>
            <button onClick={toggleOpenLinksInNewTab}>toggle new tab</button>
            <button onClick={() => setTheme('amoledblack')}>black theme</button>
            <button onClick={() => setFont('20')}>font 20</button>
            <button onClick={() => setSpacing('10')}>spacing 10</button>
        </div>
    );
}

function renderConsumer() {
    return render(
        <SettingsProvider>
            <Consumer />
        </SettingsProvider>
    );
}

function currentSettings() {
    return JSON.parse(screen.getByTestId('settings').textContent ?? '{}');
}

describe('SettingsProvider / useSettings', () => {
    let media: MatchMediaMock;

    beforeEach(() => {
        media = mockMatchMedia(false);
    });

    afterEach(() => {
        media.restore();
    });

    it('initialises from defaults and persists the system theme on first load', () => {
        renderConsumer();
        expect(currentSettings()).toEqual({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
        expect(localStorage.getItem('theme')).toBe('default');
        expect(localStorage.getItem('openLinkInNewTab')).toBeNull();
        expect(localStorage.getItem('titleFontSize')).toBeNull();
        expect(localStorage.getItem('listSpacing')).toBeNull();
    });

    it('persists the dark system theme on first load', () => {
        media.setMatches(true);
        renderConsumer();
        expect(currentSettings().theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');
    });

    it('keeps a previously saved theme', () => {
        media.setMatches(true);
        localStorage.setItem('theme', 'amoledblack');
        localStorage.setItem('titleFontSize', '24');
        renderConsumer();
        expect(currentSettings()).toMatchObject({ theme: 'amoledblack', titleFontSize: '24' });
        expect(localStorage.getItem('theme')).toBe('amoledblack');
    });

    it('toggleSettings flips showSettings without persisting', async () => {
        const user = userEvent.setup();
        renderConsumer();
        await user.click(screen.getByRole('button', { name: 'toggle settings' }));
        expect(currentSettings().showSettings).toBe(true);
        await user.click(screen.getByRole('button', { name: 'toggle settings' }));
        expect(currentSettings().showSettings).toBe(false);
        expect(Object.keys(localStorage)).toEqual(['theme']);
    });

    it('toggleOpenLinksInNewTab flips and persists the value as JSON', async () => {
        const user = userEvent.setup();
        renderConsumer();
        await user.click(screen.getByRole('button', { name: 'toggle new tab' }));
        expect(currentSettings().openLinkInNewTab).toBe(true);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
        await user.click(screen.getByRole('button', { name: 'toggle new tab' }));
        expect(currentSettings().openLinkInNewTab).toBe(false);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
    });

    it('setTheme, setFont and setSpacing update state and persist', async () => {
        const user = userEvent.setup();
        renderConsumer();
        await user.click(screen.getByRole('button', { name: 'black theme' }));
        await user.click(screen.getByRole('button', { name: 'font 20' }));
        await user.click(screen.getByRole('button', { name: 'spacing 10' }));
        expect(currentSettings()).toMatchObject({ theme: 'amoledblack', titleFontSize: '20', listSpacing: '10' });
        expect(localStorage.getItem('theme')).toBe('amoledblack');
        expect(localStorage.getItem('titleFontSize')).toBe('20');
        expect(localStorage.getItem('listSpacing')).toBe('10');
    });

    it('follows system colour scheme changes and unsubscribes on unmount', () => {
        localStorage.setItem('theme', 'amoledblack');
        const { unmount } = renderConsumer();
        expect(media.listenerCount()).toBe(1);

        act(() => media.setMatches(true));
        expect(currentSettings().theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');

        act(() => media.setMatches(false));
        expect(currentSettings().theme).toBe('default');
        expect(localStorage.getItem('theme')).toBe('default');

        unmount();
        expect(media.listenerCount()).toBe(0);
    });

    it('works without matchMedia support', () => {
        media.restore();
        renderConsumer();
        expect(currentSettings().theme).toBe('default');
        expect(localStorage.getItem('theme')).toBe('default');
    });

    it('useSettings throws a descriptive error outside SettingsProvider', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        expect(() => renderHook(() => useSettings())).toThrow('useSettings must be used within a <SettingsProvider>.');
    });
});
