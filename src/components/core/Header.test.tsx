import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from './Header';
import { renderWithProviders } from '../../test/renderWithProviders';

describe('Header', () => {
    it('renders the feed navigation links', () => {
        renderWithProviders(<Header />);

        expect(screen.getByRole('link', { name: 'new' })).toHaveAttribute('href', '/newest/1');
        expect(screen.getByRole('link', { name: 'show' })).toHaveAttribute('href', '/show/1');
        expect(screen.getByRole('link', { name: 'ask' })).toHaveAttribute('href', '/ask/1');
        expect(screen.getByRole('link', { name: 'jobs' })).toHaveAttribute('href', '/jobs/1');
        expect(screen.getByRole('link', { name: 'Logo' })).toHaveAttribute('href', '/news/1');
    });

    it('marks the active feed link', () => {
        renderWithProviders(<Header />, { route: '/show/1' });

        expect(screen.getByRole('link', { name: 'show' })).toHaveClass('active');
    });

    it('toggles the settings popup from the cog', async () => {
        renderWithProviders(<Header />);

        expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();

        await userEvent.click(screen.getByAltText('Settings'));

        expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'Close settings' }));

        expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();
    });
});
