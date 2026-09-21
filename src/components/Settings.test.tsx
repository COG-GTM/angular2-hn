import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { SettingsProvider, useSettings } from '../context';
import { Settings } from './Settings';

function Harness() {
    const { settings, toggleSettings } = useSettings();

    return (
        <>
            <button onClick={toggleSettings}>open</button>
            <span data-testid="show-settings">{String(settings.showSettings)}</span>
            <Settings />
        </>
    );
}

function renderSettings() {
    return render(
        <SettingsProvider>
            <Harness />
        </SettingsProvider>
    );
}

beforeEach(() => {
    localStorage.clear();
});

describe('Settings', () => {
    it('reflects the current settings', () => {
        renderSettings();

        expect(screen.getByRole('checkbox')).not.toBeChecked();
        expect(screen.getByLabelText('Default')).toBeChecked();
        expect(screen.getByLabelText('Font size:')).toHaveValue(16);
        expect(screen.getByLabelText('List spacing:')).toHaveValue(0);
    });

    it('closes the panel', async () => {
        const user = userEvent.setup();
        renderSettings();

        await user.click(screen.getByText('open'));
        expect(screen.getByTestId('show-settings')).toHaveTextContent('true');

        await user.click(screen.getByText('×'));
        expect(screen.getByTestId('show-settings')).toHaveTextContent('false');
    });

    it('toggles opening links in a new tab', async () => {
        const user = userEvent.setup();
        renderSettings();

        await user.click(screen.getByRole('checkbox'));

        expect(screen.getByRole('checkbox')).toBeChecked();
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('selects a theme', async () => {
        const user = userEvent.setup();
        renderSettings();

        await user.click(screen.getByLabelText('Black (AMOLED)'));

        expect(screen.getByLabelText('Black (AMOLED)')).toBeChecked();
        expect(localStorage.getItem('theme')).toBe('amoledblack');
    });

    it('changes the title font size and list spacing', async () => {
        const user = userEvent.setup();
        renderSettings();

        await user.clear(screen.getByLabelText('Font size:'));
        await user.type(screen.getByLabelText('Font size:'), '20');
        expect(localStorage.getItem('titleFontSize')).toBe('20');

        await user.clear(screen.getByLabelText('List spacing:'));
        await user.type(screen.getByLabelText('List spacing:'), '5');
        expect(localStorage.getItem('listSpacing')).toBe('5');
    });
});
