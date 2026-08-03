import { screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import FeedPage from './FeedPage';
import * as api from '../../api/hackerNewsApi';
import { makeStory } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import type { FeedName } from '../../types';

function renderFeed(feedType: FeedName, route: string) {
    return renderWithProviders(
        <Routes>
            <Route path={`/${feedType}/:page`} element={<FeedPage feedType={feedType} />} />
        </Routes>,
        { route }
    );
}

function stories(count: number, startId = 1) {
    return Array.from({ length: count }, (_unused, index) =>
        makeStory({ id: startId + index, title: `Story ${startId + index}` })
    );
}

vi.mock('../../api/hackerNewsApi');

const fetchFeed = vi.mocked(api.fetchFeed);
const scrollTo = vi.spyOn(window, 'scrollTo');

beforeEach(() => {
    fetchFeed.mockReset();
    scrollTo.mockReset();
    scrollTo.mockImplementation(() => {});
});

describe('FeedPage', () => {
    it('shows the loader until the feed arrives', async () => {
        fetchFeed.mockResolvedValue(stories(2));

        const { container } = renderFeed('news', '/news/1');

        expect(container.querySelector('.loader')).toBeInTheDocument();
        await waitForElementToBeRemoved(() => container.querySelector('.loader'));
        expect(await screen.findByText('Story 1')).toBeInTheDocument();
    });

    it('requests the feed and page from the route', async () => {
        fetchFeed.mockResolvedValue(stories(30));

        renderFeed('show', '/show/3');

        await waitFor(() => expect(fetchFeed).toHaveBeenCalledWith('show', 3, expect.any(AbortSignal)));
    });

    it('numbers the list from the position of the page', async () => {
        fetchFeed.mockResolvedValue(stories(30));

        const { container } = renderFeed('news', '/news/4');

        await screen.findByText('Story 1');
        expect(container.querySelector('ol')).toHaveAttribute('start', '91');
    });

    it('scrolls back to the top once the feed has loaded', async () => {
        fetchFeed.mockResolvedValue(stories(1));

        renderFeed('news', '/news/2');

        await waitFor(() => expect(scrollTo).toHaveBeenCalledWith(0, 0));
    });

    it('shows a feed specific error when the request fails', async () => {
        fetchFeed.mockRejectedValue(new Error('offline'));

        renderFeed('ask', '/ask/1');

        expect(await screen.findByText('Could not load ask stories.')).toBeInTheDocument();
    });

    it('hides the prev link on the first page and offers more when the page is full', async () => {
        fetchFeed.mockResolvedValue(stories(30));

        renderFeed('news', '/news/1');

        await screen.findByText('Story 1');
        expect(screen.queryByRole('link', { name: /Prev/ })).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: /More/ })).toHaveAttribute('href', '/news/2');
    });

    it('offers both directions on a later full page', async () => {
        fetchFeed.mockResolvedValue(stories(30));

        renderFeed('newest', '/newest/5');

        await screen.findByText('Story 1');
        expect(screen.getByRole('link', { name: /Prev/ })).toHaveAttribute('href', '/newest/4');
        expect(screen.getByRole('link', { name: /More/ })).toHaveAttribute('href', '/newest/6');
    });

    it('hides the more link on a partial page', async () => {
        fetchFeed.mockResolvedValue(stories(12));

        renderFeed('news', '/news/2');

        await screen.findByText('Story 1');
        expect(screen.queryByRole('link', { name: /More/ })).not.toBeInTheDocument();
    });

    it('adds the mobile list margin for every feed except jobs', async () => {
        fetchFeed.mockResolvedValue(stories(1));

        const { container, unmount } = renderFeed('news', '/news/1');

        await screen.findByText('Story 1');
        expect(container.querySelector('ol')).toHaveClass('list-margin');
        unmount();

        const jobs = renderFeed('jobs', '/jobs/1');

        await screen.findByText('Story 1');
        expect(jobs.container.querySelector('ol')).not.toHaveClass('list-margin');
    });

    it('explains the jobs feed on the jobs page only', async () => {
        fetchFeed.mockResolvedValue(stories(1));

        const { unmount } = renderFeed('news', '/news/1');

        await screen.findByText('Story 1');
        expect(screen.queryByText(/funded by Y Combinator/)).not.toBeInTheDocument();
        unmount();

        renderFeed('jobs', '/jobs/1');

        expect(await screen.findByText(/funded by Y Combinator/)).toBeInTheDocument();
    });
});
