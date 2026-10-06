import { act, render, screen } from '@testing-library/react';
import App, { AppRoutes } from './App';
import { FEED_NAMES } from './shared/models/feed-type';
import { renderWithProviders, stubMatchMedia } from './test/renderWithProviders';

// Route targets fetch from the HN API (phases 3-5); keep them in their loading state here.
beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise<Response>(() => {}));
});

describe('App routing', () => {
    it('redirects / to /news/1', async () => {
        renderWithProviders(<AppRoutes />, { route: '/' });
        expect(await screen.findByTestId('feed')).toHaveAttribute('data-feed-type', 'news');
        expect(screen.getByTestId('location')).toHaveTextContent(/^\/news\/1$/);
    });

    it.each(FEED_NAMES)('renders the %s feed with the page param', (feedType) => {
        renderWithProviders(<AppRoutes />, { route: `/${feedType}/3` });
        const feed = screen.getByTestId('feed');
        expect(feed).toHaveAttribute('data-feed-type', feedType);
        expect(feed).toHaveAttribute('data-page', '3');
    });

    it('lazy-loads the item details route', async () => {
        renderWithProviders(<AppRoutes />, { route: '/item/8863' });
        expect(await screen.findByTestId('item-details')).toHaveAttribute('data-item-id', '8863');
    });

    it('lazy-loads the user route', async () => {
        renderWithProviders(<AppRoutes />, { route: '/user/pg' });
        expect(await screen.findByTestId('user-profile')).toHaveAttribute('data-user-id', 'pg');
    });

    it.each(['/news', '/item', '/user', '/unknown/1'])('renders only the shell for unmatched %s', (route) => {
        renderWithProviders(<AppRoutes />, { route });
        expect(screen.queryByTestId('theme-root')).not.toBeInTheDocument();
        expect(screen.queryByTestId('feed')).not.toBeInTheDocument();
    });

    it('wraps the shell in header, footer and the persisted theme class', () => {
        localStorage.setItem('theme', 'amoledblack');
        renderWithProviders(<AppRoutes />, { route: '/news/1' });
        expect(screen.getByTestId('theme-root')).toHaveClass('amoledblack');
        expect(screen.getByRole('banner')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
    });
});

describe('App', () => {
    it('boots with the browser router and redirects to /news/1', async () => {
        stubMatchMedia();
        window.history.replaceState(null, '', '/');
        render(<App />);
        expect(await screen.findByTestId('feed')).toHaveAttribute('data-feed-type', 'news');
        expect(window.location.pathname).toBe('/news/1');
    });
});

describe('page views', () => {
    afterEach(() => {
        delete window.ga;
    });

    it('reports the redirected URL and subsequent navigations to Google Analytics', async () => {
        const ga = vi.fn();
        window.ga = ga;
        renderWithProviders(<AppRoutes />, { route: '/' });
        await screen.findByTestId('feed');
        expect(ga).toHaveBeenCalledWith('set', 'page', '/news/1');
        expect(ga).toHaveBeenCalledWith('send', 'pageview');
        expect(ga).not.toHaveBeenCalledWith('set', 'page', '/');

        ga.mockClear();
        await act(async () => screen.getByRole('link', { name: 'show' }).click());
        expect(ga).toHaveBeenCalledWith('set', 'page', '/show/1');
    });

    it('does nothing when analytics is not loaded', () => {
        expect(() => renderWithProviders(<AppRoutes />, { route: '/news/1' })).not.toThrow();
    });
});
