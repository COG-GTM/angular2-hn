import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { routes } from './routes';
import { SettingsProvider } from './settings';

function renderAt(path: string) {
    const router = createMemoryRouter(routes, { initialEntries: [path] });
    render(
        <SettingsProvider>
            <RouterProvider router={router} />
        </SettingsProvider>
    );
    return router;
}

afterEach(() => vi.unstubAllGlobals());

describe('routes', () => {
    it('redirects / to /news/1', async () => {
        const router = renderAt('/');
        expect(await screen.findByTestId('feed-page')).toHaveTextContent('news page 1');
        expect(router.state.location.pathname).toBe('/news/1');
    });

    it.each(['news', 'newest', 'show', 'ask', 'jobs'])('serves the %s feed', async (feed) => {
        renderAt(`/${feed}/3`);
        expect(await screen.findByTestId('feed-page')).toHaveTextContent(`${feed} page 3`);
    });

    it('lazy-loads the item and user pages', async () => {
        renderAt('/item/8863');
        expect(await screen.findByTestId('item-page')).toHaveTextContent('item 8863');
    });

    it('serves the user page', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => Response.json({ id: 'pg', karma: 1, created: 'today', created_time: 0 }))
        );
        renderAt('/user/pg');
        expect(await screen.findByText('Profile: pg')).toBeInTheDocument();
    });

    it('applies the theme class', async () => {
        localStorage.setItem('theme', 'night');
        const { container } = render(
            <SettingsProvider>
                <RouterProvider router={createMemoryRouter(routes, { initialEntries: ['/news/1'] })} />
            </SettingsProvider>
        );
        await screen.findByTestId('feed-page');
        expect(container.firstChild).toHaveClass('night');
    });
});
