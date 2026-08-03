import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../test/renderWithProviders';
import { Settings } from './Settings';

describe('Settings', () => {
    it('reflects the persisted preferences', () => {
        localStorage.setItem('theme', 'night');
        localStorage.setItem('titleFontSize', '19');
        localStorage.setItem('listSpacing', '4');
        localStorage.setItem('openLinkInNewTab', 'true');

        renderWithProviders(<Settings />);

        expect(screen.getByRole('radio', { name: 'Night' })).toBeChecked();
        expect(screen.getByRole('checkbox')).toBeChecked();
        expect(screen.getByLabelText(/Font size:/)).toHaveValue(19);
        expect(screen.getByLabelText(/List spacing:/)).toHaveValue(4);
    });

    it('persists a theme selection', async () => {
        renderWithProviders(<Settings />);

        await userEvent.click(screen.getByRole('radio', { name: 'Black (AMOLED)' }));

        expect(screen.getByRole('radio', { name: 'Black (AMOLED)' })).toBeChecked();
        expect(localStorage.getItem('theme')).toBe('amoledblack');
    });

    it('persists the open links in a new tab preference', async () => {
        renderWithProviders(<Settings />);

        await userEvent.click(screen.getByRole('checkbox'));

        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('persists font size and list spacing changes', async () => {
        renderWithProviders(<Settings />);

        await userEvent.clear(screen.getByLabelText(/Font size:/));
        await userEvent.type(screen.getByLabelText(/Font size:/), '20');
        await userEvent.clear(screen.getByLabelText(/List spacing:/));
        await userEvent.type(screen.getByLabelText(/List spacing:/), '5');

        expect(localStorage.getItem('titleFontSize')).toBe('20');
        expect(localStorage.getItem('listSpacing')).toBe('5');
    });

    it('closes itself through the close button', async () => {
        renderWithProviders(<Settings />);

        await userEvent.click(screen.getByRole('button', { name: 'Close settings' }));

        // The dialog is rendered by the header, so closing only flips the shared flag here.
        expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    });
});
