import { screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as api from '../../services/hackernewsApi';
import { makeFeed, makeStory } from '../../test/fixtures';
import { renderWithProviders } from '../../test/renderWithProviders';
import { Feed } from './Feed';

describe('Feed', () => {
    beforeEach(() => {
        vi.spyOn(api, 'fetchFeed').mockResolvedValue(makeFeed(3));
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('shows the loader until the feed resolves', async () => {
        renderWithProviders(<Feed feedType="news" />, { route: '/news/1', path: '/news/:page' });

        expect(screen.getByText('Loading...')).toBeInTheDocument();
        await waitFor(() => expect(screen.getByText('Story 1')).toBeInTheDocument());
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('requests the feed type and page from the route', async () => {
        renderWithProviders(<Feed feedType="show" />, { route: '/show/4', path: '/show/:page' });

        await waitFor(() => expect(api.fetchFeed).toHaveBeenCalledWith('show', 4, expect.any(AbortSignal)));
    });

    it('numbers the list according to the page', async () => {
        renderWithProviders(<Feed feedType="news" />, { route: '/news/3', path: '/news/:page' });

        const list = await screen.findByRole('list');
        expect(list).toHaveAttribute('start', '61');
    });

    it('defaults to page one when the route has no page', async () => {
        renderWithProviders(<Feed feedType="news" />, { route: '/news', path: '/news' });

        await waitFor(() => expect(api.fetchFeed).toHaveBeenCalledWith('news', 1, expect.any(AbortSignal)));
        expect(await screen.findByRole('list')).toHaveAttribute('start', '1');
    });

    it('hides the prev link on the first page and the more link on short pages', async () => {
        renderWithProviders(<Feed feedType="news" />, { route: '/news/1', path: '/news/:page' });

        await screen.findByText('Story 1');
        expect(screen.queryByText(/Prev/)).not.toBeInTheDocument();
        expect(screen.queryByText(/More/)).not.toBeInTheDocument();
    });

    it('links to the neighbouring pages when a full page is returned', async () => {
        vi.spyOn(api, 'fetchFeed').mockResolvedValue(makeFeed(30));

        renderWithProviders(<Feed feedType="news" />, { route: '/news/2', path: '/news/:page' });

        await screen.findByText('Story 1');
        expect(screen.getByText(/Prev/).closest('a')).toHaveAttribute('href', '/news/1');
        expect(screen.getByText(/More/).closest('a')).toHaveAttribute('href', '/news/3');
    });

    it('renders the Y Combinator blurb only for the jobs feed', async () => {
        vi.spyOn(api, 'fetchFeed').mockResolvedValue([makeStory({ type: 'job', user: null, points: null })]);

        renderWithProviders(<Feed feedType="jobs" />, { route: '/jobs/1', path: '/jobs/:page' });

        expect(await screen.findByText(/jobs at startups that were funded by Y Combinator/)).toBeInTheDocument();
        expect(screen.getByRole('list')).not.toHaveClass('list-margin');
    });

    it('scrolls to the top once the feed has loaded', async () => {
        renderWithProviders(<Feed feedType="news" />, { route: '/news/1', path: '/news/:page' });

        await waitFor(() => expect(window.scrollTo).toHaveBeenCalledWith(0, 0));
    });

    it('shows a feed specific error message when the request fails', async () => {
        vi.spyOn(api, 'fetchFeed').mockRejectedValue(new Error('offline'));

        renderWithProviders(<Feed feedType="ask" />, { route: '/ask/1', path: '/ask/:page' });

        expect(await screen.findByText('Could not load ask stories.')).toBeInTheDocument();
    });

    it('renders one item block per story', async () => {
        renderWithProviders(<Feed feedType="news" />, { route: '/news/1', path: '/news/:page' });

        const list = await screen.findByRole('list');
        expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    });
});
