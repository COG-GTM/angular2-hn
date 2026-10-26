import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { routes } from './routes';
import { SettingsProvider } from './shared/settings/SettingsProvider';
import { jsonResponse, makeComment, makeStory } from './test/fixtures';

function renderApp(path: string) {
    const router = createMemoryRouter(routes, { initialEntries: [path] });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
        <QueryClientProvider client={queryClient}>
            <SettingsProvider>
                <RouterProvider router={router} />
            </SettingsProvider>
        </QueryClientProvider>
    );
    return router;
}

function mockApi() {
    return vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
        const url = String(input);
        if (url.includes('/item/')) {
            return Promise.resolve(jsonResponse(makeStory({ id: 7, title: 'Item seven', comments: [makeComment()] })));
        }
        if (url.includes('/user/')) {
            return Promise.resolve(jsonResponse({ id: 'pg', karma: 157316, created: '20 years ago', about: 'Bug fixer.' }));
        }
        const page = Number(new URL(url).searchParams.get('page'));
        const feed = new URL(url).pathname.slice(1);
        return Promise.resolve(
            jsonResponse(
                Array.from({ length: 30 }, (_, i) =>
                    makeStory({ id: page * 100 + i, title: `${feed} story ${page}-${i}` })
                )
            )
        );
    });
}

describe('routes', () => {
    it('redirects / to /news/1', async () => {
        mockApi();
        const router = renderApp('/');
        await waitFor(() => expect(router.state.location.pathname).toBe('/news/1'));
        expect(await screen.findByText('news story 1-0')).toBeInTheDocument();
    });

    it.each(['news', 'newest', 'show', 'ask', 'jobs'])('maps /%s/:page to the %s feed', async (feed) => {
        const spy = mockApi();
        renderApp(`/${feed}/2`);
        expect(await screen.findByText(`${feed} story 2-0`)).toBeInTheDocument();
        expect(spy).toHaveBeenCalledWith(expect.stringMatching(new RegExp(`/${feed}\\?page=2$`)), expect.anything());
    });

    it('paginates with More/Prev links and numbers the list', async () => {
        mockApi();
        const router = renderApp('/news/1');
        await userEvent.click(await screen.findByRole('link', { name: 'More ›' }));
        expect(await screen.findByText('news story 2-0')).toBeInTheDocument();
        expect(router.state.location.pathname).toBe('/news/2');
        expect(screen.getByRole('list')).toHaveAttribute('start', '31');
        expect(screen.getByRole('link', { name: '‹ Prev' })).toHaveAttribute('href', '/news/1');
    });

    it('lazy-loads the item details view', async () => {
        mockApi();
        renderApp('/item/7');
        expect((await screen.findAllByText('Item seven')).length).toBeGreaterThan(0);
        expect(screen.getByRole('link', { name: 'dang' })).toBeInTheDocument();
    });

    it('lazy-loads the user view', async () => {
        mockApi();
        renderApp('/user/pg');
        expect(await screen.findByText('157316 ★')).toBeInTheDocument();
        expect(screen.getByText('Created 20 years ago')).toBeInTheDocument();
    });

    it('shows an error message when the feed fails to load', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({}, 500));
        renderApp('/news/1');
        expect(await screen.findByText('Could not load news stories.')).toBeInTheDocument();
    });

    it('sends a GA pageview on every navigation', async () => {
        mockApi();
        const ga = vi.fn();
        window.ga = ga;
        const router = renderApp('/news/1');
        await screen.findByText('news story 1-0');
        await router.navigate('/show/1');
        await waitFor(() => expect(ga).toHaveBeenCalledWith('set', 'page', '/show/1'));
        expect(ga).toHaveBeenCalledWith('set', 'page', '/news/1');
        expect(ga).toHaveBeenCalledWith('send', 'pageview');
        delete window.ga;
    });

    it('opens and closes the settings dialog from the header', async () => {
        mockApi();
        renderApp('/news/1');
        await userEvent.click(screen.getByAltText('Settings'));
        expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
        await userEvent.click(screen.getByLabelText('Night'));
        expect(localStorage.getItem('theme')).toBe('night');
        await userEvent.click(screen.getByText('×'));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});
