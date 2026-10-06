import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from './Header';
import { renderWithProviders } from '../../test/renderWithProviders';

describe('Header', () => {
    beforeEach(() => {
        vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    });

    it('renders the home link and feed navigation with Angular-compatible URLs', () => {
        renderWithProviders(<Header />, { route: '/news/1' });
        expect(screen.getByRole('link', { name: 'Logo' })).toHaveAttribute('href', '/news/1');
        expect(screen.getByRole('link', { name: 'new' })).toHaveAttribute('href', '/newest/1');
        expect(screen.getByRole('link', { name: 'show' })).toHaveAttribute('href', '/show/1');
        expect(screen.getByRole('link', { name: 'ask' })).toHaveAttribute('href', '/ask/1');
        expect(screen.getByRole('link', { name: 'jobs' })).toHaveAttribute('href', '/jobs/1');
    });

    it('marks the link for the current route as active', () => {
        renderWithProviders(<Header />, { route: '/show/1' });
        expect(screen.getByRole('link', { name: 'show' })).toHaveClass('active');
        expect(screen.getByRole('link', { name: 'ask' })).not.toHaveClass('active');
        expect(screen.getByRole('link', { name: 'Logo' })).not.toHaveClass('active');
    });

    it('navigates and scrolls to top when a nav link is clicked', async () => {
        renderWithProviders(<Header />, { route: '/news/1' });
        await userEvent.click(screen.getByRole('link', { name: 'ask' }));
        expect(screen.getByTestId('location')).toHaveTextContent('/ask/1');
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);

        await userEvent.click(screen.getByRole('link', { name: 'Logo' }));
        expect(screen.getByTestId('location')).toHaveTextContent('/news/1');
    });

    it('toggles the settings dialog from the cog by click and keyboard', async () => {
        renderWithProviders(<Header />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        const cog = screen.getByRole('button', { name: 'Settings' });
        await userEvent.click(cog);
        expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();

        cog.focus();
        await userEvent.keyboard('{Enter}');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        await userEvent.keyboard(' ');
        expect(screen.getByRole('dialog')).toBeInTheDocument();

        await userEvent.keyboard('a');
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
});
