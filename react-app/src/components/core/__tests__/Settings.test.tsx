import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { SettingsProvider, STORAGE_KEYS, useSettings } from '../../../context/SettingsContext';
import Settings from '../Settings';

function SettingsHost() {
    const { settings, toggleSettings } = useSettings();
    return (
        <>
            <button type="button" onClick={toggleSettings}>
                open settings
            </button>
            {settings.showSettings && <Settings />}
        </>
    );
}

function renderSettings() {
    return render(
        <SettingsProvider>
            <Settings />
        </SettingsProvider>
    );
}

describe('Settings', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('persists the "open links in a new tab" preference', async () => {
        const user = userEvent.setup();
        renderSettings();

        const checkbox = screen.getByRole('checkbox', { name: /open links in a new tab/i });
        expect(checkbox).not.toBeChecked();

        await user.click(checkbox);

        expect(checkbox).toBeChecked();
        expect(localStorage.getItem(STORAGE_KEYS.openLinkInNewTab)).toBe('true');
    });

    it('persists the selected theme', async () => {
        const user = userEvent.setup();
        renderSettings();

        const nightRadio = screen.getByRole('radio', { name: 'Night' });
        await user.click(nightRadio);

        expect(nightRadio).toBeChecked();
        expect(localStorage.getItem(STORAGE_KEYS.theme)).toBe('night');
    });

    it('hides the modal when the close button is clicked', async () => {
        const user = userEvent.setup();
        render(
            <SettingsProvider>
                <SettingsHost />
            </SettingsProvider>
        );

        await user.click(screen.getByRole('button', { name: 'open settings' }));
        expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /close settings/i }));

        expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();
    });
});
