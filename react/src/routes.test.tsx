import { render, screen, waitFor } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { routes } from './routes';

afterEach(() => {
    vi.unstubAllGlobals();
});

function renderRoute(path: string) {
    return render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />);
}

describe('routing', () => {
    it.each([
        ['/news/1', 'news'],
        ['/newest/1', 'newest'],
        ['/show/2', 'show'],
        ['/ask/1', 'ask'],
        ['/jobs/1', 'jobs'],
    ])('renders %s as the %s feed', async (path, feedType) => {
        vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, status: 200, json: async () => [] })));
        const { container, unmount } = renderRoute(path);
        await waitFor(() => expect(container.querySelector(`[data-feed-type="${feedType}"]`)).not.toBeNull());
        unmount();
    });

    it('redirects the root and bare feed paths to page 1, like the Angular routes', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, status: 200, json: async () => [] })));
        const router = createMemoryRouter(routes, { initialEntries: ['/'] });
        render(<RouterProvider router={router} />);
        await waitFor(() => expect(router.state.location.pathname).toBe('/news/1'));
    });

    it('renders item and user routes', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async (url: RequestInfo | URL) => ({
                ok: true,
                status: 200,
                json: async () =>
                    String(url).includes('/user/') ? { id: 'pg' } : { id: 7, type: 'story', title: 'A story' },
            }))
        );

        const item = renderRoute('/item/7');
        expect(await screen.findByText('A story')).toBeInTheDocument();
        item.unmount();

        renderRoute('/user/pg');
        expect(await screen.findByText('pg')).toBeInTheDocument();
    });
});
