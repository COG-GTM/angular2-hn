import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SettingsProvider, useSettings } from '../context/SettingsContext';
import { stubMatchMedia } from '../testUtils/matchMedia';
import { Settings } from './Settings';

function SettingsHarness() {
    const { settings, toggleSettings } = useSettings();

    return (
        <>
            <button onClick={toggleSettings}>open settings</button>
            <p>{`theme: ${settings.theme}`}</p>
            {settings.showSettings && <Settings />}
        </>
    );
}

function renderSettings() {
    stubMatchMedia(false);

    return render(
        <SettingsProvider>
            <SettingsHarness />
        </SettingsProvider>
    );
}

async function openSettings() {
    await userEvent.click(screen.getByRole('button', { name: 'open settings' }));
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('Settings', () => {
    it('renders the modal markup', async () => {
        const { container } = renderSettings();
        await openSettings();

        const overlay = container.querySelector('#popup1');
        expect(overlay).toHaveClass('overlay');
        expect(overlay?.querySelector('.popup h1')?.textContent).toBe('Settings');
        expect(overlay?.querySelector('.close')?.textContent).toBe('×');
        expect(overlay?.querySelectorAll('.control-section')).toHaveLength(3);
        expect(screen.getByText('Select a theme')).toBeInTheDocument();
        expect(screen.getByText('Change Font')).toBeInTheDocument();
        expect(screen.getByText('Links')).toBeInTheDocument();
    });

    it('closes the modal from the × button', async () => {
        const { container } = renderSettings();
        await openSettings();

        await userEvent.click(container.querySelector('.close')!);

        expect(container.querySelector('#popup1')).toBeNull();
    });

    it('checks the radio of the current theme and updates the theme when another one is picked', async () => {
        renderSettings();
        await openSettings();

        expect(screen.getByRole('radio', { name: 'Default' })).toBeChecked();

        await userEvent.click(screen.getByRole('radio', { name: 'Night' }));

        expect(screen.getByText('theme: night')).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: 'Night' })).toBeChecked();
        expect(localStorage.getItem('theme')).toBe('night');

        await userEvent.click(screen.getByRole('radio', { name: 'Black (AMOLED)' }));

        expect(screen.getByText('theme: amoledblack')).toBeInTheDocument();
        expect(localStorage.getItem('theme')).toBe('amoledblack');
    });

    it('updates the title font size on every keystroke', async () => {
        renderSettings();
        await openSettings();

        const fontSize = screen.getByLabelText('Font size:');
        expect(fontSize).toHaveValue(16);

        await userEvent.clear(fontSize);
        await userEvent.type(fontSize, '20');

        expect(fontSize).toHaveValue(20);
        expect(localStorage.getItem('titleFontSize')).toBe('20');
    });

    it('updates the list spacing on every keystroke', async () => {
        renderSettings();
        await openSettings();

        const listSpacing = screen.getByLabelText('List spacing:');
        expect(listSpacing).toHaveValue(0);

        await userEvent.clear(listSpacing);
        await userEvent.type(listSpacing, '5');

        expect(listSpacing).toHaveValue(5);
        expect(localStorage.getItem('listSpacing')).toBe('5');
    });

    it('toggles opening links in a new tab', async () => {
        renderSettings();
        await openSettings();

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).not.toBeChecked();

        await userEvent.click(checkbox);

        expect(checkbox).toBeChecked();
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');

        await userEvent.click(checkbox);

        expect(checkbox).not.toBeChecked();
        expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
    });

    it('reflects the settings restored from localStorage', async () => {
        localStorage.setItem('theme', 'amoledblack');
        localStorage.setItem('titleFontSize', '22');
        localStorage.setItem('listSpacing', '3');
        localStorage.setItem('openLinkInNewTab', 'true');

        renderSettings();
        await openSettings();

        expect(screen.getByRole('radio', { name: 'Black (AMOLED)' })).toBeChecked();
        expect(screen.getByLabelText('Font size:')).toHaveValue(22);
        expect(screen.getByLabelText('List spacing:')).toHaveValue(3);
        expect(screen.getByRole('checkbox')).toBeChecked();
    });
});
