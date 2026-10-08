import { screen, waitFor } from '@testing-library/react';

import { makeStory } from '../test/fixtures';
import { mockFetch, renderApp } from '../test/utils';

describe('routes', () => {
    it('redirects / to /news/1', async () => {
        const { router } = renderApp({ route: '/' });
        await waitFor(() => expect(router.state.location.pathname).toBe('/news/1'));
    });

    it.each(['news', 'newest', 'show', 'ask', 'jobs'])('/%s/:page passes feedType and page', async (feed) => {
        const { container } = renderApp({ route: `/${feed}/3` });
        await waitFor(() => expect(container.querySelector(`[data-feed="${feed}"]`)).toHaveAttribute('data-page', '3'));
    });

    it('lazy-loads /item/:id and /user/:id', async () => {
        mockFetch({ '/item/8863': makeStory({ id: 8863, title: 'item 8863' }) });
        renderApp({ route: '/item/8863' });
        expect((await screen.findAllByText('item 8863')).length).toBeGreaterThan(0);
    });

    it('lazy-loads /user/:id', async () => {
        renderApp({ route: '/user/pg' });
        expect(await screen.findByText('user pg')).toBeInTheDocument();
    });

    it('sends unknown paths to /news/1', async () => {
        const { router } = renderApp({ route: '/nope' });
        await waitFor(() => expect(router.state.location.pathname).toBe('/news/1'));
    });
});
