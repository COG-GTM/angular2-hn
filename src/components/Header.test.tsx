import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Header } from './Header';
import { renderWithProviders, mockMatchMedia } from '../test/utils';

beforeEach(() => {
    localStorage.clear();
    mockMatchMedia(false);
});

describe('Header', () => {
    it('links to every feed', () => {
        renderWithProviders(<Header />);

        expect(screen.getByRole('link', { name: 'new' })).toHaveAttribute('href', '/newest/1');
        expect(screen.getByRole('link', { name: 'show' })).toHaveAttribute('href', '/show/1');
        expect(screen.getByRole('link', { name: 'ask' })).toHaveAttribute('href', '/ask/1');
        expect(screen.getByRole('link', { name: 'jobs' })).toHaveAttribute('href', '/jobs/1');
        expect(screen.getByAltText('Logo').closest('a')).toHaveAttribute('href', '/news/1');
    });

    it('scrolls to the top when a nav link is clicked', async () => {
        const scrollTo = vi.fn();
        vi.stubGlobal('scrollTo', scrollTo);

        renderWithProviders(<Header />);
        await userEvent.click(screen.getByRole('link', { name: 'show' }));

        expect(scrollTo).toHaveBeenCalledWith(0, 0);
        vi.unstubAllGlobals();
    });

    it('toggles the settings panel with the cog', async () => {
        renderWithProviders(<Header />);

        expect(screen.queryByText('Settings', { selector: 'h1' })).not.toBeInTheDocument();

        await userEvent.click(screen.getByAltText('Settings'));
        expect(screen.getByText('Settings', { selector: 'h1' })).toBeInTheDocument();

        await userEvent.click(screen.getByAltText('Settings'));
        expect(screen.queryByText('Settings', { selector: 'h1' })).not.toBeInTheDocument();
    });
});
