import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { routes } from '../routes';
import { SettingsProvider } from '../settings';

function renderAt(path: string) {
    const router = createMemoryRouter(routes, { initialEntries: [path] });
    const view = render(
        <SettingsProvider>
            <RouterProvider router={router} />
        </SettingsProvider>
    );
    return { router, ...view };
}

afterEach(() => {
    delete window.ga;
});

describe('app shell', () => {
    it('renders header nav links and footer', async () => {
        renderAt('/news/1');
        await screen.findByTestId('feed-page');
        for (const label of ['new', 'show', 'ask', 'jobs']) {
            expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
        }
        expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
            'href',
            'https://github.com/hdjirdeh/angular2-hn'
        );
    });

    it('navigates via the header and marks the active link', async () => {
        const { router } = renderAt('/news/1');
        await screen.findByTestId('feed-page');
        await userEvent.click(screen.getByRole('link', { name: 'show' }));
        expect(router.state.location.pathname).toBe('/show/1');
        await screen.findByTestId('feed-page');
        expect(screen.getByRole('link', { name: 'show' })).toHaveClass('active');
        expect(screen.getByRole('link', { name: 'new' })).not.toHaveClass('active');
    });

    it('opens settings, changes theme and preferences, and closes', async () => {
        const { container } = renderAt('/news/1');
        await screen.findByTestId('feed-page');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
        const dialog = screen.getByRole('dialog', { name: 'Settings' });

        await userEvent.click(within(dialog).getByLabelText('Night'));
        expect(container.firstChild).toHaveClass('night');
        expect(localStorage.getItem('theme')).toBe('night');

        await userEvent.click(within(dialog).getByLabelText('Open links in a new tab'));
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');

        const font = within(dialog).getByLabelText('Font size:');
        await userEvent.clear(font);
        await userEvent.type(font, '20');
        expect(localStorage.getItem('titleFontSize')).toBe('20');

        await userEvent.click(within(dialog).getByRole('button', { name: 'Close settings' }));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('sends a GA pageview on each route change', async () => {
        const ga = vi.fn();
        window.ga = ga;
        const { router } = renderAt('/');
        await screen.findByTestId('feed-page');
        await router.navigate('/item/1');
        await screen.findByTestId('item-page');
        expect(ga).toHaveBeenCalledWith('set', 'page', '/news/1');
        expect(ga).toHaveBeenCalledWith('set', 'page', '/item/1');
        expect(ga.mock.calls.filter(([cmd]) => cmd === 'send')).toEqual([
            ['send', 'pageview'],
            ['send', 'pageview'],
        ]);
    });
});
