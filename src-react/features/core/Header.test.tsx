import { screen } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '../../shared/test-utils';
import { Header } from './Header';

function LocationProbe() {
    return <div data-testid="location">{useLocation().pathname}</div>;
}

function renderHeader(route = '/news/1') {
    return renderWithProviders(
        <>
            <Header />
            <LocationProbe />
        </>,
        { route }
    );
}

const navLink = (name: string) => screen.getByRole('link', { name });

describe('Header', () => {
    it('renders the logo home link and the new/show/ask/jobs nav links', () => {
        renderHeader();
        expect(navLink('Logo')).toHaveAttribute('href', '/news/1');
        expect(navLink('Logo')).toHaveClass('home-link');
        expect(navLink('new')).toHaveAttribute('href', '/newest/1');
        expect(navLink('show')).toHaveAttribute('href', '/show/1');
        expect(navLink('ask')).toHaveAttribute('href', '/ask/1');
        expect(navLink('jobs')).toHaveAttribute('href', '/jobs/1');
        expect(document.querySelector('.header-nav')).toHaveTextContent(/^new \| show \| ask \| jobs$/);
    });

    it('marks the home link active on /news/1', () => {
        renderHeader('/news/1');
        expect(navLink('Logo')).toHaveClass('home-link', 'active');
        for (const name of ['new', 'show', 'ask', 'jobs']) expect(navLink(name)).not.toHaveClass('active');
    });

    it.each([
        ['/newest/1', 'new'],
        ['/show/1', 'show'],
        ['/ask/1', 'ask'],
        ['/jobs/1', 'jobs'],
    ])('marks only the matching nav link active on %s', (route, active) => {
        renderHeader(route);
        expect(navLink(active)).toHaveClass('active');
        expect(navLink(active)).toHaveAttribute('aria-current', 'page');
        expect(navLink('Logo')).not.toHaveClass('active');
        for (const name of ['new', 'show', 'ask', 'jobs'].filter((n) => n !== active)) {
            expect(navLink(name)).not.toHaveClass('active');
        }
    });

    it('is not active on other pages of the same feed (Angular routerLinkActive parity)', () => {
        renderHeader('/show/2');
        expect(navLink('show')).not.toHaveClass('active');
    });

    it('navigates and scrolls to the top when a nav link is clicked', async () => {
        const { user } = renderHeader('/news/3');
        await user.click(navLink('ask'));
        expect(screen.getByTestId('location')).toHaveTextContent('/ask/1');
        expect(navLink('ask')).toHaveClass('active');
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);

        await user.click(navLink('Logo'));
        expect(screen.getByTestId('location')).toHaveTextContent('/news/1');
    });

    it('opens and closes the settings popup with the cog', async () => {
        const { user } = renderHeader();
        const cog = screen.getByRole('button', { name: 'Settings' });
        expect(cog.tagName).toBe('IMG');
        expect(cog).toHaveClass('settings');
        expect(cog).toHaveAttribute('aria-expanded', 'false');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        await user.click(cog);
        expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
        expect(cog).toHaveAttribute('aria-expanded', 'true');

        await user.click(cog);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('toggles settings from the keyboard with Enter and Space', async () => {
        const { user } = renderHeader();
        const cog = screen.getByRole('button', { name: 'Settings' });
        cog.focus();
        await user.keyboard('{Enter}');
        expect(screen.getByRole('dialog')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Close settings' }));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        cog.focus();
        await user.keyboard(' ');
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('closes with × and returns focus to the cog', async () => {
        const { user } = renderHeader();
        const cog = screen.getByRole('button', { name: 'Settings' });
        await user.click(cog);
        expect(screen.getByRole('dialog')).toHaveFocus();

        await user.click(screen.getByRole('button', { name: 'Close settings' }));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(cog).toHaveFocus();
    });

    it('closes with × from the keyboard and with Escape', async () => {
        const { user } = renderHeader();
        const cog = screen.getByRole('button', { name: 'Settings' });
        await user.click(cog);
        screen.getByRole('button', { name: 'Close settings' }).focus();
        await user.keyboard('{Enter}');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(cog).toHaveFocus();

        await user.keyboard('{Enter}');
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        await user.keyboard('{Escape}');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(cog).toHaveFocus();
    });
});
