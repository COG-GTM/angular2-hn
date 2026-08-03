import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Settings from './Settings';
import { renderWithProviders } from '../../test/render';

describe('Settings', () => {
    it('reflects the stored preferences', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('theme', 'night');
        localStorage.setItem('titleFontSize', '19');
        localStorage.setItem('listSpacing', '4');

        renderWithProviders(<Settings />);

        expect(screen.getByRole('checkbox')).toBeChecked();
        expect(screen.getByRole('radio', { name: 'Night' })).toBeChecked();
        expect(screen.getByRole('radio', { name: 'Default' })).not.toBeChecked();
        expect(screen.getByLabelText(/Font size/)).toHaveValue(19);
        expect(screen.getByLabelText(/List spacing/)).toHaveValue(4);
    });

    it('toggles opening links in a new tab', async () => {
        renderWithProviders(<Settings />);

        await userEvent.click(screen.getByRole('checkbox'));

        expect(screen.getByRole('checkbox')).toBeChecked();
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('offers the three themes and applies the selected one', async () => {
        renderWithProviders(<Settings />);

        expect(screen.getAllByRole('radio')).toHaveLength(3);

        await userEvent.click(screen.getByRole('radio', { name: 'Black (AMOLED)' }));

        expect(screen.getByRole('radio', { name: 'Black (AMOLED)' })).toBeChecked();
        expect(localStorage.getItem('theme')).toBe('amoledblack');
    });

    it('updates the title font size and list spacing', async () => {
        renderWithProviders(<Settings />);

        await userEvent.clear(screen.getByLabelText(/Font size/));
        await userEvent.type(screen.getByLabelText(/Font size/), '20');
        expect(localStorage.getItem('titleFontSize')).toBe('20');

        await userEvent.clear(screen.getByLabelText(/List spacing/));
        await userEvent.type(screen.getByLabelText(/List spacing/), '7');
        expect(localStorage.getItem('listSpacing')).toBe('7');
    });
});
