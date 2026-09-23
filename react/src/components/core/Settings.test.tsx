import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

import { SettingsProvider, useSettings } from '../../settings/SettingsContext';
import { Settings } from './Settings';

function ShowSettingsState() {
    const { settings } = useSettings();
    return <span data-testid="show-settings">{String(settings.showSettings)}</span>;
}

function renderWithSettings(ui: ReactElement = <Settings />) {
    return render(
        <SettingsProvider>
            {ui}
            <ShowSettingsState />
        </SettingsProvider>
    );
}

describe('Settings', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('renders the overlay markup of the Angular settings template', () => {
        const { container } = renderWithSettings();

        expect(container.querySelector('#popup1.overlay')).toBeInTheDocument();
        expect(container.querySelector('.popup .content')).toBeInTheDocument();
        expect(container.querySelectorAll('.control-section')).toHaveLength(3);
        expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 2, name: 'Links' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 2, name: 'Select a theme' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 2, name: 'Change Font' })).toBeInTheDocument();
    });

    it('closes the panel through toggleSettings when the × is clicked', async () => {
        const user = userEvent.setup();
        const { container } = renderWithSettings();

        expect(screen.getByTestId('show-settings')).toHaveTextContent('false');
        await user.click(container.querySelector('.close') as HTMLElement);

        expect(screen.getByTestId('show-settings')).toHaveTextContent('true');
    });

    it('toggles the open-links-in-a-new-tab preference', async () => {
        const user = userEvent.setup();
        renderWithSettings();

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).not.toBeChecked();

        await user.click(checkbox);

        expect(checkbox).toBeChecked();
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('offers the three themes and checks the active one', async () => {
        const user = userEvent.setup();
        renderWithSettings();

        const themes = screen.getAllByRole('radio');
        expect(themes.map((input) => (input as HTMLInputElement).value)).toEqual([
            'default',
            'night',
            'amoledblack',
        ]);
        expect(screen.getByLabelText('Default')).toBeChecked();

        await user.click(screen.getByLabelText('Black (AMOLED)'));

        expect(screen.getByLabelText('Black (AMOLED)')).toBeChecked();
        expect(screen.getByLabelText('Default')).not.toBeChecked();
        expect(localStorage.getItem('theme')).toBe('amoledblack');
    });

    it('stores the title font size and the list spacing as they are typed', async () => {
        const user = userEvent.setup();
        renderWithSettings();

        const fontSize = screen.getByLabelText(/Font size:/);
        await user.clear(fontSize);
        await user.type(fontSize, '20');
        expect(localStorage.getItem('titleFontSize')).toBe('20');

        const spacing = screen.getByLabelText(/List spacing:/);
        await user.clear(spacing);
        await user.type(spacing, '5');
        expect(localStorage.getItem('listSpacing')).toBe('5');
    });
});
