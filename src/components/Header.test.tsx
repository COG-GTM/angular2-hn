import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import Header from './Header';
import { renderWithProviders, screen } from '../test/renderWithProviders';

describe('Header', () => {
    it('renders navigation links to every feed route', () => {
        renderWithProviders(<Header />);

        expect(screen.getByRole('link', { name: 'Logo' })).toHaveAttribute('href', '/news/1');
        expect(screen.getByRole('link', { name: 'new' })).toHaveAttribute('href', '/newest/1');
        expect(screen.getByRole('link', { name: 'show' })).toHaveAttribute('href', '/show/1');
        expect(screen.getByRole('link', { name: 'ask' })).toHaveAttribute('href', '/ask/1');
        expect(screen.getByRole('link', { name: 'jobs' })).toHaveAttribute('href', '/jobs/1');
    });

    it('toggles the settings modal with the settings button', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Header />);

        expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();

        await user.click(screen.getByRole('img', { name: 'Settings' }));
        expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();

        await user.click(screen.getByRole('img', { name: 'Settings' }));
        expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();
    });
});
