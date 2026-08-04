import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../test-utils';
import Header from './Header';

beforeEach(() => {
    localStorage.clear();
});

describe('Header', () => {
    it('renders the logo and the feed navigation', () => {
        renderWithProviders(<Header />);

        expect(screen.getByAltText('Logo').closest('a')).toHaveAttribute('href', '/news/1');
        expect(screen.getByRole('link', { name: 'new' })).toHaveAttribute('href', '/newest/1');
        expect(screen.getByRole('link', { name: 'show' })).toHaveAttribute('href', '/show/1');
        expect(screen.getByRole('link', { name: 'ask' })).toHaveAttribute('href', '/ask/1');
        expect(screen.getByRole('link', { name: 'jobs' })).toHaveAttribute('href', '/jobs/1');
    });

    it('opens the settings dialog when the cog is clicked', async () => {
        const user = userEvent.setup();
        const { container } = renderWithProviders(<Header />);

        expect(container.querySelector('#popup1')).not.toBeInTheDocument();

        await user.click(screen.getByAltText('Settings'));

        expect(container.querySelector('#popup1')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    });

    it('marks the active feed link', () => {
        renderWithProviders(<Header />, { route: '/show/1' });

        expect(screen.getByRole('link', { name: 'show' })).toHaveClass('active');
        expect(screen.getByRole('link', { name: 'ask' })).not.toHaveClass('active');
    });
});
