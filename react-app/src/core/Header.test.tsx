import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { mockFetch, renderApp, renderWithProviders } from '../test/utils';
import { Header } from './Header';

describe('Header', () => {
    beforeEach(() => {
        mockFetch({ 'node-hnapi': [] });
    });

    it('links the logo to /news/1 and the nav to each feed', () => {
        const { container } = renderWithProviders(<Header />);
        expect(container.querySelector('a.home-link')).toHaveAttribute('href', '/news/1');
        expect(screen.getByAltText('Logo')).toHaveAttribute('src', 'assets/images/logo.svg');
        const nav = container.querySelector('.header-nav')!;
        expect(nav).toHaveTextContent('new | show | ask | jobs');
        expect(screen.getByRole('link', { name: 'new' })).toHaveAttribute('href', '/newest/1');
        expect(screen.getByRole('link', { name: 'show' })).toHaveAttribute('href', '/show/1');
        expect(screen.getByRole('link', { name: 'ask' })).toHaveAttribute('href', '/ask/1');
        expect(screen.getByRole('link', { name: 'jobs' })).toHaveAttribute('href', '/jobs/1');
    });

    it.each([
        ['/newest/1', 'new'],
        ['/show/1', 'show'],
        ['/ask/1', 'ask'],
        ['/jobs/1', 'jobs'],
    ])('marks the %s link active', async (route, label) => {
        renderApp({ route });
        const link = await screen.findByRole('link', { name: label });
        expect(link).toHaveClass('active');
        for (const other of ['new', 'show', 'ask', 'jobs'].filter((l) => l !== label)) {
            expect(screen.getByRole('link', { name: other })).not.toHaveClass('active');
        }
    });

    it('marks the logo link active on /news/1', async () => {
        const { container } = renderApp({ route: '/news/1' });
        await waitFor(() => expect(container.querySelector('a.home-link')).toHaveClass('active'));
    });

    it('navigates and scrolls to the top when a nav link is clicked', async () => {
        const user = userEvent.setup();
        const { router, container } = renderApp({ route: '/news/1' });
        await user.click(await screen.findByRole('link', { name: 'show' }));
        expect(router.state.location.pathname).toBe('/show/1');
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);

        vi.mocked(window.scrollTo).mockClear();
        await user.click(container.querySelector('a.home-link')!);
        expect(router.state.location.pathname).toBe('/news/1');
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('toggles the settings popup with the cog', async () => {
        const user = userEvent.setup();
        const { container } = renderWithProviders(<Header />);
        expect(container.querySelector('#popup1')).toBeNull();

        await user.click(screen.getByAltText('Settings'));
        expect(container.querySelector('header #popup1.overlay > .popup')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();

        await user.click(screen.getByAltText('Settings'));
        expect(container.querySelector('#popup1')).toBeNull();
    });

    it('opens and closes settings from the keyboard', async () => {
        const user = userEvent.setup();
        const { container } = renderWithProviders(<Header />);
        const cog = screen.getByRole('button', { name: 'Settings' });
        expect(cog).toHaveAttribute('aria-expanded', 'false');

        await user.tab();
        await user.tab();
        await user.tab();
        await user.tab();
        await user.tab();
        await user.tab();
        expect(cog).toHaveFocus();
        await user.keyboard('{Enter}');
        expect(container.querySelector('#popup1')).toBeInTheDocument();
        expect(cog).toHaveAttribute('aria-expanded', 'true');

        screen.getByRole('button', { name: 'Close settings' }).focus();
        await user.keyboard(' ');
        expect(container.querySelector('#popup1')).toBeNull();
    });
});
