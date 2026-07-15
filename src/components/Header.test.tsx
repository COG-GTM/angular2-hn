import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/utils';
import { mockMatchMedia } from '../test/setup';
import Header from './Header';

beforeEach(() => {
    localStorage.clear();
    mockMatchMedia(false);
});

describe('Header', () => {
    it('toggles the settings overlay when the cog icon is clicked', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Header />, { route: '/news/1' });
        expect(document.querySelector('#popup1')).not.toBeInTheDocument();

        await user.click(screen.getByAltText('Settings'));
        expect(document.querySelector('#popup1')).toBeInTheDocument();

        await user.click(screen.getByAltText('Settings'));
        expect(document.querySelector('#popup1')).not.toBeInTheDocument();
    });

    it('closes the settings overlay with the close button', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Header />, { route: '/news/1' });
        await user.click(screen.getByAltText('Settings'));
        expect(document.querySelector('#popup1')).toBeInTheDocument();
        await user.click(screen.getByText('×'));
        expect(document.querySelector('#popup1')).not.toBeInTheDocument();
    });

    it('scrolls to the top when a nav link is clicked', async () => {
        const user = userEvent.setup();
        const scrollSpy = vi.spyOn(window, 'scrollTo');
        renderWithProviders(<Header />, { route: '/news/1' });
        await user.click(screen.getByRole('link', { name: 'new' }));
        expect(scrollSpy).toHaveBeenCalledWith(0, 0);
    });
});
