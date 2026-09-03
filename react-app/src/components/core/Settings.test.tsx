import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '../../test/utils';
import { Settings } from './Settings';

describe('Settings', () => {
    it('persists a theme selection', async () => {
        renderWithProviders(<Settings />);

        await userEvent.click(screen.getByRole('radio', { name: 'Night' }));

        expect(screen.getByRole('radio', { name: 'Night' })).toBeChecked();
        expect(localStorage.getItem('theme')).toBe('night');
    });

    it('persists font size and list spacing', async () => {
        renderWithProviders(<Settings />);

        await userEvent.clear(screen.getByLabelText(/Font size/));
        await userEvent.type(screen.getByLabelText(/Font size/), '20');
        await userEvent.clear(screen.getByLabelText(/List spacing/));
        await userEvent.type(screen.getByLabelText(/List spacing/), '5');

        expect(localStorage.getItem('titleFontSize')).toBe('20');
        expect(localStorage.getItem('listSpacing')).toBe('5');
    });

    it('persists the link behavior checkbox', async () => {
        renderWithProviders(<Settings />);

        await userEvent.click(screen.getByRole('checkbox', { name: /Open links in a new tab/ }));

        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });
});
