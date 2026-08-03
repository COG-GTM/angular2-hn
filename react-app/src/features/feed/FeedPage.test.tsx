import { screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';

import { fetchFeed } from '../../shared/api/hackernews-api';
import { makeStories } from '../../test/fixtures';
import { renderWithProviders } from '../../test/renderWithProviders';
import FeedPage from './FeedPage';

vi.mock('../../shared/api/hackernews-api', () => ({
    fetchFeed: vi.fn(),
}));

const fetchFeedMock = vi.mocked(fetchFeed);

function renderFeed(route: string, feedType: 'news' | 'jobs' = 'news') {
    return renderWithProviders(
        <Routes>
            <Route path={`/${feedType}/:page`} element={<FeedPage feedType={feedType} />} />
        </Routes>,
        { route }
    );
}

describe('FeedPage', () => {
    beforeEach(() => {
        localStorage.clear();
        fetchFeedMock.mockReset();
        vi.stubGlobal('scrollTo', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('shows the loader until the feed resolves, then the stories', async () => {
        fetchFeedMock.mockResolvedValue(makeStories(2));

        renderFeed('/news/1');
        expect(screen.getByText('Loading...')).toBeInTheDocument();

        expect(await screen.findByText('Story 1')).toBeInTheDocument();
        expect(screen.getByText('Story 2')).toBeInTheDocument();
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        expect(fetchFeedMock).toHaveBeenCalledWith('news', 1);
    });

    it('scrolls back to the top once the feed is loaded', async () => {
        fetchFeedMock.mockResolvedValue(makeStories(1));

        renderFeed('/news/3');

        await waitFor(() => expect(window.scrollTo).toHaveBeenCalledWith(0, 0));
    });

    it('numbers the list from the requested page', async () => {
        fetchFeedMock.mockResolvedValue(makeStories(30));

        const { container } = renderFeed('/news/4');

        await screen.findByText('Story 1');
        expect(container.querySelector('ol')).toHaveAttribute('start', '91');
        expect(fetchFeedMock).toHaveBeenCalledWith('news', 4);
    });

    it('links to the next page while a full page of stories is returned', async () => {
        fetchFeedMock.mockResolvedValue(makeStories(30));

        renderFeed('/news/2');

        expect(await screen.findByRole('link', { name: /More/ })).toHaveAttribute('href', '/news/3');
        expect(screen.getByRole('link', { name: /Prev/ })).toHaveAttribute('href', '/news/1');
    });

    it('hides both pagination links on a short first page', async () => {
        fetchFeedMock.mockResolvedValue(makeStories(12));

        renderFeed('/news/1');

        await screen.findByText('Story 1');
        expect(screen.queryByRole('link', { name: /More/ })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /Prev/ })).not.toBeInTheDocument();
    });

    it('shows an error message when the feed cannot be loaded', async () => {
        fetchFeedMock.mockRejectedValue(new Error('offline'));

        renderFeed('/news/1');

        expect(await screen.findByText('Could not load news stories.')).toBeInTheDocument();
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('shows the Y Combinator blurb on the jobs feed', async () => {
        fetchFeedMock.mockResolvedValue(makeStories(1, { type: 'job' }));

        renderFeed('/jobs/1', 'jobs');

        expect(await screen.findByText(/jobs at startups that were funded by Y Combinator/)).toBeInTheDocument();
    });
});
