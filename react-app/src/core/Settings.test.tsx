import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../test/utils';
import { Header } from './Header';

function renderOpen(settings = {}) {
    return renderWithProviders(<Header />, { settings: { showSettings: true, ...settings } });
}

describe('Settings', () => {
    it('closes with the × button', async () => {
        const user = userEvent.setup();
        const { container } = renderOpen();
        await user.click(screen.getByText('×'));
        expect(container.querySelector('#popup1')).toBeNull();
    });

    it('toggles "Open links in a new tab" and persists it', async () => {
        const user = userEvent.setup();
        renderOpen();
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).not.toBeChecked();

        await user.click(checkbox);
        expect(checkbox).toBeChecked();
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');

        await user.click(checkbox);
        expect(checkbox).not.toBeChecked();
        expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
    });

    it('checks the current theme and persists a new one', async () => {
        const user = userEvent.setup();
        renderOpen({ theme: 'default' });
        expect(screen.getByLabelText('Default')).toBeChecked();

        for (const [label, theme] of [
            ['Night', 'night'],
            ['Black (AMOLED)', 'amoledblack'],
            ['Default', 'default'],
        ]) {
            await user.click(screen.getByLabelText(label));
            expect(screen.getByLabelText(label)).toBeChecked();
            expect(localStorage.getItem('theme')).toBe(theme);
        }
    });

    it('shows the saved font size and list spacing', () => {
        renderOpen({ titleFontSize: '20', listSpacing: '3' });
        expect(screen.getByLabelText('Font size:')).toHaveValue(20);
        expect(screen.getByLabelText('List spacing:')).toHaveValue(3);
    });

    it('saves the font size on keyup', async () => {
        const user = userEvent.setup();
        renderOpen();
        const input = screen.getByLabelText('Font size:');
        expect(input).toHaveAttribute('min', '1');
        await user.clear(input);
        await user.type(input, '22');
        expect(input).toHaveValue(22);
        expect(localStorage.getItem('titleFontSize')).toBe('22');
    });

    it('saves the list spacing on keyup', async () => {
        const user = userEvent.setup();
        renderOpen();
        const input = screen.getByLabelText('List spacing:');
        expect(input).toHaveAttribute('min', '0');
        await user.clear(input);
        await user.type(input, '7');
        expect(input).toHaveValue(7);
        expect(localStorage.getItem('listSpacing')).toBe('7');
    });

    it('keeps the values when reopened', async () => {
        const user = userEvent.setup();
        renderOpen();
        await user.clear(screen.getByLabelText('Font size:'));
        await user.type(screen.getByLabelText('Font size:'), '18');
        await user.click(screen.getByText('×'));
        await user.click(screen.getByAltText('Settings'));
        expect(screen.getByLabelText('Font size:')).toHaveValue(18);
    });

    it('saves changes made without a keyup (spinner, paste)', () => {
        renderOpen();
        fireEvent.change(screen.getByLabelText('Font size:'), { target: { value: '17' } });
        fireEvent.change(screen.getByLabelText('List spacing:'), { target: { value: '2' } });
        expect(localStorage.getItem('titleFontSize')).toBe('17');
        expect(localStorage.getItem('listSpacing')).toBe('2');
        fireEvent.click(screen.getByText('×'));
        fireEvent.click(screen.getByAltText('Settings'));
        expect(screen.getByLabelText('Font size:')).toHaveValue(17);
        expect(screen.getByLabelText('List spacing:')).toHaveValue(2);
    });
});
