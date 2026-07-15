import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsProvider } from '../context/SettingsContext';
import { mockMatchMedia } from '../test/setup';
import Settings from './Settings';

function renderSettings() {
    return render(
        <SettingsProvider>
            <Settings />
        </SettingsProvider>
    );
}

beforeEach(() => {
    localStorage.clear();
    mockMatchMedia(false);
});

describe('Settings', () => {
    it('reflects the current theme in the radio buttons', () => {
        localStorage.setItem('theme', 'night');
        renderSettings();
        expect(screen.getByRole('radio', { name: 'Night' })).toBeChecked();
        expect(screen.getByRole('radio', { name: 'Default' })).not.toBeChecked();
    });

    it('updates the theme when a radio is selected', async () => {
        const user = userEvent.setup();
        renderSettings();
        await user.click(screen.getByRole('radio', { name: 'Black (AMOLED)' }));
        expect(screen.getByRole('radio', { name: 'Black (AMOLED)' })).toBeChecked();
        expect(localStorage.getItem('theme')).toBe('amoledblack');
    });

    it('reflects and toggles the open-in-new-tab checkbox', async () => {
        const user = userEvent.setup();
        renderSettings();
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).not.toBeChecked();
        await user.click(checkbox);
        expect(checkbox).toBeChecked();
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('updates the font size setting', async () => {
        const user = userEvent.setup();
        renderSettings();
        const fontInput = screen.getAllByRole('spinbutton')[0];
        await user.clear(fontInput);
        await user.type(fontInput, '22');
        expect(fontInput).toHaveValue(22);
        expect(localStorage.getItem('titleFontSize')).toBe('22');
    });

    it('updates the list spacing setting', async () => {
        const user = userEvent.setup();
        renderSettings();
        const spacingInput = screen.getAllByRole('spinbutton')[1];
        await user.clear(spacingInput);
        await user.type(spacingInput, '9');
        expect(spacingInput).toHaveValue(9);
        expect(localStorage.getItem('listSpacing')).toBe('9');
    });
});
