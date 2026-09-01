import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { SettingsProvider } from '../shared/settings/SettingsContext';
import { Header } from './Header';

function renderHeader(initialEntries = ['/news/1']) {
    return render(
        <MemoryRouter initialEntries={initialEntries}>
            <SettingsProvider>
                <Header />
            </SettingsProvider>
        </MemoryRouter>
    );
}

describe('Header', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        delete window.ga;
    });

    it('renders the logo and navigation links', () => {
        renderHeader();

        expect(screen.getByRole('link', { name: 'Logo' })).toHaveAttribute('href', '/news/1');
        expect(screen.getByRole('link', { name: 'Logo' })).toHaveClass('home-link');
        expect(screen.getByRole('img', { name: 'Logo' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'new' })).toHaveAttribute('href', '/newest/1');
        expect(screen.getByRole('link', { name: 'show' })).toHaveAttribute('href', '/show/1');
        expect(screen.getByRole('link', { name: 'ask' })).toHaveAttribute('href', '/ask/1');
        expect(screen.getByRole('link', { name: 'jobs' })).toHaveAttribute('href', '/jobs/1');
    });

    it('scrolls to the top when a navigation link is clicked', async () => {
        const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
        renderHeader();

        await userEvent.click(screen.getByRole('link', { name: 'ask' }));

        expect(scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('marks the current navigation link active', () => {
        renderHeader(['/ask/1']);

        expect(screen.getByRole('link', { name: 'ask' })).toHaveClass('active');
    });

    it('toggles settings from the settings icon', async () => {
        renderHeader();

        await userEvent.click(screen.getByRole('img', { name: 'Settings' }));
        expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();

        await userEvent.click(screen.getByRole('img', { name: 'Settings' }));
        expect(screen.queryByRole('heading', { name: 'Settings' })).not.toBeInTheDocument();
    });
});
