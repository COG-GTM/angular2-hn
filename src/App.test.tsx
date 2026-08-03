import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import * as api from './services/hackernewsApi';
import { makeFeed, makeStory, makeUser } from './test/fixtures';
import { renderWithProviders } from './test/renderWithProviders';

describe('App', () => {
    beforeEach(() => {
        vi.spyOn(api, 'fetchFeed').mockResolvedValue(makeFeed(3));
        vi.spyOn(api, 'fetchItemContent').mockResolvedValue(makeStory({ content: '<p>Story body</p>' }));
        vi.spyOn(api, 'fetchUser').mockResolvedValue(makeUser());
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('redirects the root path to the first page of news', async () => {
        renderWithProviders(<App />, { route: '/' });

        await waitFor(() => expect(api.fetchFeed).toHaveBeenCalledWith('news', 1, expect.any(AbortSignal)));
        expect(await screen.findByText('Story 1')).toBeInTheDocument();
    });

    it('redirects a feed without a page to its first page', async () => {
        renderWithProviders(<App />, { route: '/ask' });

        await waitFor(() => expect(api.fetchFeed).toHaveBeenCalledWith('ask', 1, expect.any(AbortSignal)));
    });

    it('redirects unknown routes back to the news feed', async () => {
        renderWithProviders(<App />, { route: '/does-not-exist' });

        await waitFor(() => expect(api.fetchFeed).toHaveBeenCalledWith('news', 1, expect.any(AbortSignal)));
    });

    it.each([
        ['/news/2', 'news', 2],
        ['/newest/1', 'newest', 1],
        ['/show/1', 'show', 1],
        ['/jobs/1', 'jobs', 1],
    ])('renders the feed for %s', async (route, feedType, page) => {
        renderWithProviders(<App />, { route });

        await waitFor(() => expect(api.fetchFeed).toHaveBeenCalledWith(feedType, page, expect.any(AbortSignal)));
    });

    it('lazy loads the item details route', async () => {
        renderWithProviders(<App />, { route: '/item/1' });

        expect(await screen.findByText('Story body')).toBeInTheDocument();
        expect(api.fetchItemContent).toHaveBeenCalledWith(1, expect.any(AbortSignal));
    });

    it('lazy loads the user route', async () => {
        renderWithProviders(<App />, { route: '/user/alice' });

        expect(await screen.findByText('1234 ★')).toBeInTheDocument();
        expect(api.fetchUser).toHaveBeenCalledWith('alice', expect.any(AbortSignal));
    });

    it('applies the active theme class to the app shell', async () => {
        localStorage.setItem('theme', 'amoledblack');

        const { container } = renderWithProviders(<App />, { route: '/news/1' });

        await screen.findByText('Story 1');
        expect(container.firstElementChild).toHaveClass('amoledblack');
    });

    it('renders the header and footer around the routed page', async () => {
        renderWithProviders(<App />, { route: '/news/1' });

        expect(screen.getByAltText('Logo')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
        await screen.findByText('Story 1');
    });

    it('navigates between feeds through the header', async () => {
        renderWithProviders(<App />, { route: '/news/1' });
        await screen.findByText('Story 1');

        await userEvent.click(screen.getByRole('link', { name: 'jobs' }));

        await waitFor(() => expect(api.fetchFeed).toHaveBeenCalledWith('jobs', 1, expect.any(AbortSignal)));
    });

    it('reports page views to Google Analytics on navigation', async () => {
        const ga = vi.fn();
        window.ga = ga;

        renderWithProviders(<App />, { route: '/news/1' });
        await screen.findByText('Story 1');

        expect(ga).toHaveBeenCalledWith('set', 'page', '/news/1');
        expect(ga).toHaveBeenCalledWith('send', 'pageview');

        await userEvent.click(screen.getByRole('link', { name: 'show' }));
        await waitFor(() => expect(ga).toHaveBeenCalledWith('set', 'page', '/show/1'));

        delete window.ga;
    });

    it('renders without analytics available', async () => {
        delete window.ga;

        renderWithProviders(<App />, { route: '/news/1' });

        expect(await screen.findByText('Story 1')).toBeInTheDocument();
    });
});
