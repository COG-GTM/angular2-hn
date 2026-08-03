import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Header from './Header';
import { renderWithProviders } from '../../test/render';

describe('Header', () => {
    it('links to every feed', () => {
        renderWithProviders(<Header />);

        expect(screen.getByRole('link', { name: 'Logo' })).toHaveAttribute('href', '/news/1');
        expect(screen.getByRole('link', { name: 'new' })).toHaveAttribute('href', '/newest/1');
        expect(screen.getByRole('link', { name: 'show' })).toHaveAttribute('href', '/show/1');
        expect(screen.getByRole('link', { name: 'ask' })).toHaveAttribute('href', '/ask/1');
        expect(screen.getByRole('link', { name: 'jobs' })).toHaveAttribute('href', '/jobs/1');
    });

    it('marks the link of the current feed page as active', () => {
        renderWithProviders(<Header />, { route: '/show/1' });

        expect(screen.getByRole('link', { name: 'show' })).toHaveClass('active');
        expect(screen.getByRole('link', { name: 'ask' })).not.toHaveClass('active');
    });

    it('leaves the feed link inactive on later pages, as routerLinkActive did', () => {
        renderWithProviders(<Header />, { route: '/show/2' });

        expect(screen.getByRole('link', { name: 'show' })).not.toHaveClass('active');
    });

    it('scrolls back to the top when a feed link is clicked', async () => {
        const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
        renderWithProviders(<Header />);

        await userEvent.click(screen.getByRole('link', { name: 'ask' }));

        expect(scrollTo).toHaveBeenCalledWith(0, 0);
        scrollTo.mockRestore();
    });

    it('opens and closes the settings panel from the cog', async () => {
        renderWithProviders(<Header />);

        expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();

        await userEvent.click(screen.getByAltText('Settings'));
        expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();

        await userEvent.click(screen.getByText('×'));
        expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();
    });
});
