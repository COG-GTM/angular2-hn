import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../test/renderWithProviders';
import { Header } from './Header';

describe('Header', () => {
    it('renders every feed link', () => {
        renderWithProviders(<Header />);

        expect(screen.getByRole('link', { name: 'new' })).toHaveAttribute('href', '/newest/1');
        expect(screen.getByRole('link', { name: 'show' })).toHaveAttribute('href', '/show/1');
        expect(screen.getByRole('link', { name: 'ask' })).toHaveAttribute('href', '/ask/1');
        expect(screen.getByRole('link', { name: 'jobs' })).toHaveAttribute('href', '/jobs/1');
        expect(screen.getByAltText('Logo').closest('a')).toHaveAttribute('href', '/news/1');
    });

    it('marks the current feed link as active', () => {
        renderWithProviders(<Header />, { route: '/show/1' });

        expect(screen.getByRole('link', { name: 'show' })).toHaveClass('active');
        expect(screen.getByRole('link', { name: 'ask' })).not.toHaveClass('active');
    });

    it('scrolls back to the top when a feed link is clicked', async () => {
        renderWithProviders(<Header />);

        await userEvent.click(screen.getByRole('link', { name: 'ask' }));

        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('opens and closes the settings dialog', async () => {
        renderWithProviders(<Header />);

        expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();

        await userEvent.click(screen.getByAltText('Settings'));
        expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();

        await userEvent.click(screen.getByAltText('Settings'));
        expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();
    });
});
