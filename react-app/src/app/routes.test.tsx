import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';

import { SettingsProvider } from '../shared/settings';
import { createTestQueryClient } from '../shared/test-utils';
import { routes } from './routes';

function renderAt(url: string) {
    const router = createMemoryRouter(routes, { initialEntries: [url] });
    render(
        <QueryClientProvider client={createTestQueryClient()}>
            <SettingsProvider>
                <RouterProvider router={router} />
            </SettingsProvider>
        </QueryClientProvider>
    );
    return router;
}

describe('routes', () => {
    it('redirects / to /news/1', async () => {
        const router = renderAt('/');
        expect(await screen.findByTestId('feed-list')).toHaveTextContent('news page 1');
        expect(router.state.location.pathname).toBe('/news/1');
    });

    it.each(['news', 'newest', 'show', 'ask', 'jobs'])('/%s/:page renders FeedList inside the shell', async (feed) => {
        renderAt(`/${feed}/2`);
        expect(await screen.findByTestId('feed-list')).toHaveTextContent(`${feed} page 2`);
        expect(screen.getByTestId('header')).toBeInTheDocument();
        expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('lazy-loads /item/:id and /user/:id', async () => {
        renderAt('/item/8863');
        expect(await screen.findByTestId('item-details')).toHaveTextContent('item 8863');
    });

    it('lazy-loads /user/:id', async () => {
        renderAt('/user/pg');
        expect(await screen.findByTestId('user-profile')).toHaveTextContent('user pg');
    });

    it.each(['/nope', '/news', '/item'])(
        'unknown %s keeps the shell with an empty outlet (Angular has no wildcard)',
        async (url) => {
            const router = renderAt(url);
            expect(await screen.findByTestId('header')).toBeInTheDocument();
            expect(screen.getByTestId('footer')).toBeInTheDocument();
            expect(screen.queryByTestId('feed-list')).not.toBeInTheDocument();
            expect(router.state.location.pathname).toBe(url);
        }
    );
});
