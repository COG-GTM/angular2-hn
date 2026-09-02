import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { SettingsProvider } from '../settings';
import { mockMatchMedia } from '../test/matchMedia';
import { Header } from './Header';

function renderHeader(initialPath = '/news/1') {
    return render(
        <MemoryRouter initialEntries={[initialPath]}>
            <SettingsProvider>
                <Header />
            </SettingsProvider>
        </MemoryRouter>
    );
}

describe('Header', () => {
    beforeEach(() => {
        localStorage.clear();
        mockMatchMedia(false);
    });

    it('renders the logo link and nav links with the expected hrefs', () => {
        const { container } = renderHeader();
        const home = screen.getByRole('link', { name: 'Logo' });
        expect(home).toHaveAttribute('href', '/news/1');
        expect(home).toHaveClass('home-link', 'active');
        expect(container.querySelector('.home-link .logo-inner')).not.toBeNull();
        expect(screen.getByAltText('Logo')).toHaveAttribute('src', 'assets/images/logo.svg');

        expect(screen.getByRole('link', { name: 'new' })).toHaveAttribute('href', '/newest/1');
        expect(screen.getByRole('link', { name: 'show' })).toHaveAttribute('href', '/show/1');
        expect(screen.getByRole('link', { name: 'ask' })).toHaveAttribute('href', '/ask/1');
        expect(screen.getByRole('link', { name: 'jobs' })).toHaveAttribute('href', '/jobs/1');
        expect(container.querySelector('#header .header-text .left .header-nav')).toHaveTextContent(
            'new | show | ask | jobs'
        );
        expect(container.querySelector('.info img.settings')).toHaveAttribute('src', 'assets/images/cog.svg');
    });

    it('marks only the active nav link', () => {
        renderHeader('/show/1');
        expect(screen.getByRole('link', { name: 'show' })).toHaveClass('active');
        expect(screen.getByRole('link', { name: 'new' })).not.toHaveClass('active');
        expect(screen.getByRole('link', { name: 'Logo' })).not.toHaveClass('active');
    });

    it('toggles the settings panel with the cog', async () => {
        const user = userEvent.setup();
        const { container } = renderHeader();
        expect(container.querySelector('#popup1')).toBeNull();

        await user.click(screen.getByAltText('Settings'));
        expect(container.querySelector('#popup1')).not.toBeNull();

        await user.click(screen.getByAltText('Settings'));
        expect(container.querySelector('#popup1')).toBeNull();
    });

    it('scrolls to the top when a nav link is clicked', async () => {
        const user = userEvent.setup();
        const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
        renderHeader();

        await user.click(screen.getByRole('link', { name: 'new' }));
        expect(scrollTo).toHaveBeenCalledWith(0, 0);

        await user.click(screen.getByRole('link', { name: 'Logo' }));
        expect(scrollTo).toHaveBeenCalledTimes(2);
        scrollTo.mockRestore();
    });
});
