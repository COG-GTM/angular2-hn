import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsPanel } from './SettingsPanel';
import { SettingsProvider } from './SettingsProvider';
import { useSettings } from './useSettings';

type MediaListener = (event: MediaQueryListEvent) => void;

const listeners = new Set<MediaListener>();

function stubPrefersDark(matches: boolean) {
    listeners.clear();
    vi.stubGlobal(
        'matchMedia',
        vi.fn((media: string) => ({
            media,
            matches,
            addEventListener: (_type: string, listener: MediaListener) => listeners.add(listener),
            removeEventListener: (_type: string, listener: MediaListener) => listeners.delete(listener),
        }))
    );
}

function renderPanel() {
    return render(
        <SettingsProvider>
            <SettingsPanel />
        </SettingsProvider>
    );
}

beforeEach(() => {
    localStorage.clear();
    stubPrefersDark(false);
});

describe('SettingsPanel', () => {
    it('renders the same markup as the Angular settings template', () => {
        const { container } = renderPanel();

        expect(container.querySelector('#popup1.overlay')).not.toBeNull();
        expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeInTheDocument();
        expect(container.querySelector('.popup .close')?.textContent).toBe('×');
        expect(
            ['Links', 'Select a theme', 'Change Font'].map((name) =>
                screen.getByRole('heading', { level: 2, name }).textContent
            )
        ).toEqual(['Links', 'Select a theme', 'Change Font']);
        expect(container.querySelectorAll('.control-section')).toHaveLength(3);
        expect(screen.getByText('Open links in a new tab')).toBeInTheDocument();
        expect(screen.getAllByRole('radio').map((radio) => (radio as HTMLInputElement).value)).toEqual([
            'default',
            'night',
            'amoledblack',
        ]);
        expect(screen.getByLabelText('Font size:')).toHaveValue(16);
        expect(screen.getByLabelText('List spacing:')).toHaveValue(0);
    });

    it('closes the panel through the settings store, like closeSettings()', async () => {
        const user = userEvent.setup();
        let showSettings: boolean | undefined;

        function Probe() {
            showSettings = useSettings().settings.showSettings;
            return null;
        }

        render(
            <SettingsProvider>
                <Probe />
                <SettingsPanel />
            </SettingsProvider>
        );

        expect(showSettings).toBe(false);
        await user.click(screen.getByText('×'));
        expect(showSettings).toBe(true);
    });

    it('persists the open-links-in-new-tab toggle', async () => {
        const user = userEvent.setup();
        renderPanel();
        const checkbox = screen.getByRole('checkbox');

        expect(checkbox).not.toBeChecked();
        await user.click(checkbox);

        expect(checkbox).toBeChecked();
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('selects and persists a theme', async () => {
        const user = userEvent.setup();
        renderPanel();

        expect(screen.getByRole('radio', { name: 'Default' })).toBeChecked();
        await user.click(screen.getByRole('radio', { name: 'Black (AMOLED)' }));

        expect(screen.getByRole('radio', { name: 'Black (AMOLED)' })).toBeChecked();
        expect(localStorage.getItem('theme')).toBe('amoledblack');
    });

    it('persists the title font size and the list spacing', async () => {
        const user = userEvent.setup();
        renderPanel();

        await user.clear(screen.getByLabelText('Font size:'));
        await user.type(screen.getByLabelText('Font size:'), '20');
        await user.clear(screen.getByLabelText('List spacing:'));
        await user.type(screen.getByLabelText('List spacing:'), '5');

        expect(localStorage.getItem('titleFontSize')).toBe('20');
        expect(localStorage.getItem('listSpacing')).toBe('5');
        expect(screen.getByLabelText('Font size:')).toHaveValue(20);
        expect(screen.getByLabelText('List spacing:')).toHaveValue(5);
    });
});

describe('SettingsProvider', () => {
    it('restores persisted settings', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('theme', 'night');
        localStorage.setItem('titleFontSize', '22');
        localStorage.setItem('listSpacing', '4');

        renderPanel();

        expect(screen.getByRole('checkbox')).toBeChecked();
        expect(screen.getByRole('radio', { name: 'Night' })).toBeChecked();
        expect(screen.getByLabelText('Font size:')).toHaveValue(22);
        expect(screen.getByLabelText('List spacing:')).toHaveValue(4);
    });

    it('falls back to the system colour scheme when no theme is stored', () => {
        stubPrefersDark(true);

        renderPanel();

        expect(screen.getByRole('radio', { name: 'Night' })).toBeChecked();
        expect(localStorage.getItem('theme')).toBe('night');
    });

    it('follows later system colour scheme changes', () => {
        renderPanel();
        expect(screen.getByRole('radio', { name: 'Default' })).toBeChecked();

        act(() => listeners.forEach((listener) => listener({ matches: true } as MediaQueryListEvent)));

        expect(screen.getByRole('radio', { name: 'Night' })).toBeChecked();
        expect(localStorage.getItem('theme')).toBe('night');
    });
});
