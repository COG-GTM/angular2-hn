import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '../test/renderWithProviders';
import Header from './Header';

describe('Header', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('renders the feed navigation', () => {
        renderWithProviders(<Header />);

        expect(screen.getByRole('link', { name: 'new' })).toHaveAttribute('href', '/newest/1');
        expect(screen.getByRole('link', { name: 'show' })).toHaveAttribute('href', '/show/1');
        expect(screen.getByRole('link', { name: 'ask' })).toHaveAttribute('href', '/ask/1');
        expect(screen.getByRole('link', { name: 'jobs' })).toHaveAttribute('href', '/jobs/1');
        expect(screen.getByRole('img', { name: 'Logo' }).closest('a')).toHaveAttribute('href', '/news/1');
    });

    it('marks the link of the current feed as active', () => {
        renderWithProviders(<Header />, { route: '/show/1' });

        expect(screen.getByRole('link', { name: 'show' })).toHaveClass('active');
        expect(screen.getByRole('link', { name: 'ask' })).not.toHaveClass('active');
    });

    it('scrolls to the top when a feed link is clicked', async () => {
        const scrollTo = vi.fn();
        vi.stubGlobal('scrollTo', scrollTo);
        renderWithProviders(<Header />);

        await userEvent.click(screen.getByRole('link', { name: 'new' }));

        expect(scrollTo).toHaveBeenCalledWith(0, 0);
        vi.unstubAllGlobals();
    });

    it('toggles the settings panel through the store', async () => {
        const { store } = renderWithProviders(<Header />);

        expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('img', { name: 'Settings' }));

        expect(store.getSettings().showSettings).toBe(true);
        expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    });
});
