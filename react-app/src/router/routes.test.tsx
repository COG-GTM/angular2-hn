import { screen, waitFor } from '@testing-library/react';

import { renderApp } from '../test/utils';

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
        renderApp({ route: '/item/8863' });
        expect(await screen.findByText('item 8863')).toBeInTheDocument();
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
