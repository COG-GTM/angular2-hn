import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '../../test/utils';
import { Header } from './Header';

describe('Header', () => {
    it('marks the current feed link as active', () => {
        renderWithProviders(<Header />, { route: '/ask/1' });

        expect(screen.getByRole('link', { name: 'ask' })).toHaveClass('active');
        expect(screen.getByRole('link', { name: 'show' })).not.toHaveClass('active');
    });

    it('opens the settings popup from the cog', async () => {
        renderWithProviders(<Header />);

        expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();
        await userEvent.click(screen.getByAltText('Settings'));

        expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    });
});
