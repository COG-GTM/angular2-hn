import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsProvider } from '../context';
import { Header } from './Header';

function renderHeader() {
    return render(
        <MemoryRouter initialEntries={['/news/1']}>
            <SettingsProvider>
                <Header />
            </SettingsProvider>
        </MemoryRouter>
    );
}

beforeEach(() => {
    localStorage.clear();
});

describe('Header', () => {
    it('renders the feed navigation', () => {
        renderHeader();

        expect(screen.getByRole('link', { name: 'new' })).toHaveAttribute('href', '/newest/1');
        expect(screen.getByRole('link', { name: 'show' })).toHaveAttribute('href', '/show/1');
        expect(screen.getByRole('link', { name: 'ask' })).toHaveAttribute('href', '/ask/1');
        expect(screen.getByRole('link', { name: 'jobs' })).toHaveAttribute('href', '/jobs/1');
        expect(screen.getByAltText('Logo').closest('a')).toHaveAttribute('href', '/news/1');
    });

    it('scrolls to the top when a feed link is clicked', async () => {
        const scrollTo = vi.fn();
        vi.stubGlobal('scrollTo', scrollTo);
        const user = userEvent.setup();

        renderHeader();
        await user.click(screen.getByRole('link', { name: 'show' }));

        expect(scrollTo).toHaveBeenCalledWith(0, 0);
        vi.unstubAllGlobals();
    });

    it('toggles the settings panel from the cog', async () => {
        const user = userEvent.setup();

        renderHeader();
        expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();

        await user.click(screen.getByAltText('Settings'));
        expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();

        await user.click(screen.getByAltText('Settings'));
        expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();
    });
});
