import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import Settings from './Settings';
import { renderWithProviders, screen } from '../test/renderWithProviders';

describe('Settings', () => {
    it('persists the selected theme', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Settings />);

        await user.click(screen.getByRole('radio', { name: 'Night' }));

        expect(screen.getByRole('radio', { name: 'Night' })).toBeChecked();
        expect(localStorage.getItem('theme')).toBe('night');

        await user.click(screen.getByRole('radio', { name: 'Black (AMOLED)' }));

        expect(localStorage.getItem('theme')).toBe('amoledblack');
    });

    it('persists the title font size', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Settings />);

        const fontSize = screen.getByLabelText(/Font size/);
        await user.clear(fontSize);
        await user.type(fontSize, '20');

        expect(fontSize).toHaveValue(20);
        expect(localStorage.getItem('titleFontSize')).toBe('20');
    });

    it('persists the list spacing', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Settings />);

        const spacing = screen.getByLabelText(/List spacing/);
        await user.clear(spacing);
        await user.type(spacing, '8');

        expect(spacing).toHaveValue(8);
        expect(localStorage.getItem('listSpacing')).toBe('8');
    });

    it('toggles opening links in a new tab', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Settings />);

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).not.toBeChecked();

        await user.click(checkbox);

        expect(checkbox).toBeChecked();
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');

        await user.click(checkbox);

        expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
    });
});
