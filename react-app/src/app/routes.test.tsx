import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, Outlet, RouterProvider, useParams } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { SettingsProvider } from '../shared/settings';
import { createTestQueryClient } from '../shared/test-utils';
import { routes } from './routes';

// Routing only: feature modules are stubbed so this test stays green whatever Wave 2 ships.
vi.mock('../features/shell', () => ({
    AppShell: () => (
        <div data-testid="app-shell">
            <Outlet />
        </div>
    ),
}));
vi.mock('../features/feeds', () => ({
    FeedList: ({ feedType }: { feedType: string }) => (
        <p data-testid="feed-list">
            {feedType} {useParams().page}
        </p>
    ),
}));
vi.mock('../features/item-details', () => ({
    ItemDetails: () => <p data-testid="item-details">{useParams().id}</p>,
}));
vi.mock('../features/user', () => ({
    UserProfile: () => <p data-testid="user-profile">{useParams().id}</p>,
}));

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
        expect(await screen.findByTestId('feed-list')).toHaveTextContent('news 1');
        expect(router.state.location.pathname).toBe('/news/1');
    });

    it.each(['news', 'newest', 'show', 'ask', 'jobs'])('/%s/:page renders FeedList inside AppShell', async (feed) => {
        renderAt(`/${feed}/2`);
        const list = await screen.findByTestId('feed-list');
        expect(list).toHaveTextContent(`${feed} 2`);
        expect(screen.getByTestId('app-shell')).toContainElement(list);
    });

    it('lazy-loads /item/:id inside AppShell', async () => {
        renderAt('/item/8863');
        const item = await screen.findByTestId('item-details');
        expect(item).toHaveTextContent('8863');
        expect(screen.getByTestId('app-shell')).toContainElement(item);
    });

    it('lazy-loads /user/:id inside AppShell', async () => {
        renderAt('/user/pg');
        const user = await screen.findByTestId('user-profile');
        expect(user).toHaveTextContent('pg');
        expect(screen.getByTestId('app-shell')).toContainElement(user);
    });

    it.each(['/nope', '/news', '/item'])(
        'unknown %s keeps AppShell with an empty outlet (Angular has no wildcard)',
        async (url) => {
            const router = renderAt(url);
            expect(await screen.findByTestId('app-shell')).toBeEmptyDOMElement();
            expect(router.state.location.pathname).toBe(url);
        }
    );
});
