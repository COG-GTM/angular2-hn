import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Settings from './Settings';
import { renderWithProviders } from '../../test/renderWithProviders';

describe('Settings', () => {
    it('reflects the current settings', () => {
        localStorage.setItem('theme', 'night');
        localStorage.setItem('openLinkInNewTab', 'true');

        renderWithProviders(<Settings />);

        expect(screen.getByRole('radio', { name: 'Night' })).toBeChecked();
        expect(screen.getByRole('checkbox', { name: /Open links in a new tab/ })).toBeChecked();
    });

    it('persists the selected theme', async () => {
        renderWithProviders(<Settings />);

        await userEvent.click(screen.getByRole('radio', { name: 'Black (AMOLED)' }));

        expect(screen.getByRole('radio', { name: 'Black (AMOLED)' })).toBeChecked();
        expect(localStorage.getItem('theme')).toBe('amoledblack');
    });

    it('toggles opening links in a new tab', async () => {
        renderWithProviders(<Settings />);

        await userEvent.click(screen.getByRole('checkbox', { name: /Open links in a new tab/ }));

        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('updates the title font size and list spacing', async () => {
        renderWithProviders(<Settings />);

        const fontInput = screen.getByRole('spinbutton', { name: /Font size/ });
        await userEvent.clear(fontInput);
        await userEvent.type(fontInput, '20');

        const spacingInput = screen.getByRole('spinbutton', { name: /List spacing/ });
        await userEvent.clear(spacingInput);
        await userEvent.type(spacingInput, '5');

        expect(localStorage.getItem('titleFontSize')).toBe('20');
        expect(localStorage.getItem('listSpacing')).toBe('5');
    });
});
