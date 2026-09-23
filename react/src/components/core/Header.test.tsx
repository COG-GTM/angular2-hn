import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsProvider } from '../../settings/SettingsContext';
import { Header } from './Header';

function renderHeader(path = '/news/1') {
    return render(
        <MemoryRouter initialEntries={[path]}>
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

    it('renders the logo link and the feed navigation of the Angular header template', () => {
        const { container } = renderHeader();

        const home = container.querySelector('a.home-link');
        expect(home).toHaveAttribute('href', '/news/1');
        expect(home?.querySelector('.logo-inner')).toBeInTheDocument();
        expect(screen.getByAltText('Logo')).toHaveAttribute('src', '/assets/images/logo.svg');

        const navLinks = container.querySelectorAll('.header-nav a');
        expect(Array.from(navLinks).map((link) => [link.textContent, link.getAttribute('href')])).toEqual([
            ['new', '/newest/1'],
            ['show', '/show/1'],
            ['ask', '/ask/1'],
            ['jobs', '/jobs/1'],
        ]);
        expect(container.querySelector('.header-nav')?.textContent).toBe('new | show | ask | jobs');
    });

    it('marks the link of the current route active, as routerLinkActive did', () => {
        const { container } = renderHeader('/show/1');

        expect(container.querySelector('a.active')?.textContent).toBe('show');
        expect(container.querySelector('a.home-link')).not.toHaveClass('active');
    });

    it('scrolls back to the top when a navigation link is clicked', async () => {
        const user = userEvent.setup();
        const scrollTo = vi.fn();
        vi.stubGlobal('scrollTo', scrollTo);

        renderHeader();
        await user.click(screen.getByText('ask'));

        expect(scrollTo).toHaveBeenCalledWith(0, 0);
        vi.unstubAllGlobals();
    });

    it('toggles the settings panel from the cog button', async () => {
        const user = userEvent.setup();
        const { container } = renderHeader();

        expect(container.querySelector('#popup1')).not.toBeInTheDocument();

        await user.click(screen.getByAltText('Settings'));
        expect(container.querySelector('#popup1')).toBeInTheDocument();

        await user.click(container.querySelector('.close') as HTMLElement);
        expect(container.querySelector('#popup1')).not.toBeInTheDocument();
    });
});
