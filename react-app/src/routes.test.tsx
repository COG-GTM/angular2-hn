import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
    fetchMock = vi.fn(async () => new Response('[]'));
    vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => vi.unstubAllGlobals());

const fetchedUrls = () => fetchMock.mock.calls.map(([url]) => url);

describe('routes', () => {
    it('redirects / to /news/1', async () => {
        const router = renderAt('/');
        await screen.findByTestId('feed-page');
        expect(fetchedUrls()).toContain('https://node-hnapi.herokuapp.com/news?page=1');
        expect(router.state.location.pathname).toBe('/news/1');
    });

    it.each(['news', 'newest', 'show', 'ask', 'jobs'])('serves the %s feed', async (feed) => {
        renderAt(`/${feed}/3`);
        await screen.findByTestId('feed-page');
        expect(fetchedUrls()).toContain(`https://node-hnapi.herokuapp.com/${feed}?page=3`);
    });

    it('lazy-loads the item and user pages', async () => {
        renderAt('/item/8863');
        expect(await screen.findByTestId('item-page')).toHaveTextContent('item 8863');
    });

    it('serves the user page', async () => {
        renderAt('/user/pg');
        expect(await screen.findByTestId('user-page')).toHaveTextContent('user pg');
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
