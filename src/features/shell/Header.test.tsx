import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '../../shared/test-utils';
import { Header } from './Header';

function renderHeader(route = '/news/1') {
    // path '*' keeps the header mounted while navigating.
    return renderWithProviders(<Header />, { route });
}

const cog = () => screen.getByRole('button', { name: 'Settings' });

describe('Header', () => {
    it('renders the logo link to /news/1 and the new | show | ask | jobs nav', () => {
        const { container } = renderHeader();
        const home = container.querySelector('a.home-link');
        expect(home).toHaveAttribute('href', '/news/1');
        expect(home?.querySelector('img.logo')).toHaveAttribute('src', '/assets/images/logo.svg');
        expect(home?.querySelector('.logo-inner')).toBeInTheDocument();
        const nav = container.querySelector('.header-nav');
        expect(nav).toHaveTextContent(/^new \| show \| ask \| jobs$/);
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
    ])('marks only the active nav link on %s', (route, label) => {
        renderHeader(route);
        for (const name of ['new', 'show', 'ask', 'jobs']) {
            const link = screen.getByRole('link', { name });
            if (name === label) expect(link).toHaveClass('active');
            else expect(link).not.toHaveClass('active');
        }
    });

    it('marks the home link active on /news/1 only (routerLinkActive parity)', () => {
        const { container, unmount } = renderHeader('/news/1');
        expect(container.querySelector('a.home-link')).toHaveClass('active');
        unmount();
        const second = renderHeader('/news/2');
        expect(second.container.querySelector('a.home-link')).not.toHaveClass('active');
    });

    it('scrolls to top and navigates when a nav link or the logo is clicked', async () => {
        const { user, container } = renderHeader('/news/3');
        await user.click(screen.getByRole('link', { name: 'show' }));
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
        expect(screen.getByRole('link', { name: 'show' })).toHaveClass('active');
        await user.click(container.querySelector('a.home-link') as HTMLElement);
        expect(window.scrollTo).toHaveBeenCalledTimes(2);
        expect(container.querySelector('a.home-link')).toHaveClass('active');
    });

    it('cog is a keyboard-operable button that toggles the Settings popup', async () => {
        const { user } = renderHeader();
        expect(cog()).toHaveAttribute('tabindex', '0');
        expect(cog()).toHaveAttribute('aria-expanded', 'false');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        await user.click(cog());
        expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
        expect(cog()).toHaveAttribute('aria-expanded', 'true');

        // A synthetic second click (no hit-testing in jsdom) toggles it closed like Angular's handler.
        await user.click(cog());
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        cog().focus();
        await user.keyboard('{Enter}');
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        await user.keyboard('{Escape}');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        cog().focus();
        await user.keyboard(' ');
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('moves focus into the popup and returns it to the cog on close', async () => {
        const { user } = renderHeader();
        await user.click(cog());
        const close = screen.getByRole('button', { name: 'Close settings' });
        expect(close).toHaveFocus();
        await user.click(close);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(cog()).toHaveFocus();
    });

    it('renders the popup inside <header>, after #header (overlay stacks above the header)', async () => {
        const { user, container } = renderHeader();
        await user.click(cog());
        const header = container.querySelector('header');
        expect(header?.children[0]).toHaveAttribute('id', 'header');
        expect(header?.children[1]).toHaveAttribute('id', 'popup1');
    });
});
