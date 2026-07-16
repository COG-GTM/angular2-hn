import { fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Header } from './Header';
import { renderWithProviders } from '../../test/renderWithProviders';

describe('Header', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders navigation links with the correct hrefs', () => {
        renderWithProviders(<Header />);
        expect(screen.getByRole('link', { name: 'new' })).toHaveAttribute('href', '/newest/1');
        expect(screen.getByRole('link', { name: 'show' })).toHaveAttribute('href', '/show/1');
        expect(screen.getByRole('link', { name: 'ask' })).toHaveAttribute('href', '/ask/1');
        expect(screen.getByRole('link', { name: 'jobs' })).toHaveAttribute('href', '/jobs/1');
        expect(screen.getByRole('link', { name: /Logo/ })).toHaveAttribute('href', '/news/1');
    });

    it('toggles the settings popup when the cog is clicked', () => {
        renderWithProviders(<Header />);
        expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();

        fireEvent.click(screen.getByAltText('Settings'));
        expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();

        fireEvent.click(screen.getByAltText('Settings'));
        expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();
    });

    it('closes the popup via the × button', () => {
        renderWithProviders(<Header />);
        fireEvent.click(screen.getByAltText('Settings'));
        expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();

        fireEvent.click(screen.getByText('×'));
        expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();
    });

    it('scrolls to the top when a nav link is clicked', () => {
        renderWithProviders(<Header />);
        fireEvent.click(screen.getByRole('link', { name: 'new' }));
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });
});
