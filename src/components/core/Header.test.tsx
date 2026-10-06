import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../test/render';
import { Header } from './Header';

beforeEach(() => {
    localStorage.clear();
});

describe('Header', () => {
    it('renders nav links to page 1 of each feed', () => {
        renderWithProviders(<Header />, { route: '/news/1' });
        expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/news/1');
        expect(screen.getByRole('link', { name: 'new' })).toHaveAttribute('href', '/newest/1');
        expect(screen.getByRole('link', { name: 'show' })).toHaveAttribute('href', '/show/1');
        expect(screen.getByRole('link', { name: 'ask' })).toHaveAttribute('href', '/ask/1');
        expect(screen.getByRole('link', { name: 'jobs' })).toHaveAttribute('href', '/jobs/1');
    });

    it('marks the current feed as active on any page', () => {
        renderWithProviders(<Header />, { route: '/show/4' });
        expect(screen.getByRole('link', { name: 'show' })).toHaveClass('active');
        expect(screen.getByRole('link', { name: 'new' })).not.toHaveClass('active');
        expect(screen.getByRole('link', { name: 'Home' })).not.toHaveClass('active');
    });

    it('navigates when a nav link is clicked', async () => {
        renderWithProviders(<Header />, { route: '/news/1' });
        await userEvent.click(screen.getByRole('link', { name: 'jobs' }));
        expect(screen.getByTestId('location')).toHaveTextContent('/jobs/1');
    });

    it('toggles the settings dialog from the cog button', async () => {
        renderWithProviders(<Header />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});
