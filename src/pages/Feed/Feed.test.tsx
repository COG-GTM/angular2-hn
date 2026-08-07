import { screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Feed from './Feed';
import { Story } from '../../models/story';
import { fetchFeed } from '../../api/hackernews';
import { renderWithProviders, stubMatchMedia } from '../../testUtils';

vi.mock('../../api/hackernews', () => ({
    fetchFeed: vi.fn(),
}));

const fetchFeedMock = vi.mocked(fetchFeed);

function makeStories(count: number, startId = 1): Story[] {
    return Array.from({ length: count }, (_, index) => ({
        id: startId + index,
        title: `Story ${startId + index}`,
        points: 10,
        user: 'pg',
        time_ago: '1 hour ago',
        type: 'story',
        url: `https://example.com/${startId + index}`,
        domain: 'example.com',
        comments_count: 3,
    })) as unknown as Story[];
}

function renderFeed(feedType: string, page: number) {
    return renderWithProviders(<Feed feedType={feedType} />, {
        path: `/${feedType}/:page`,
        route: `/${feedType}/${page}`,
    });
}

describe('Feed', () => {
    beforeEach(() => {
        localStorage.clear();
        stubMatchMedia();
        fetchFeedMock.mockReset();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('shows the loader until the feed resolves', async () => {
        fetchFeedMock.mockResolvedValue(makeStories(3));

        const { container } = renderFeed('news', 1);
        expect(screen.getByText('Loading...')).toBeInTheDocument();

        await waitFor(() => expect(container.querySelectorAll('li.post')).toHaveLength(3));
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('requests the feed for the route params and renders the stories', async () => {
        fetchFeedMock.mockResolvedValue(makeStories(2));

        renderFeed('show', 3);

        await waitFor(() => expect(screen.getByRole('link', { name: 'Story 1' })).toBeInTheDocument());
        expect(fetchFeedMock).toHaveBeenCalledWith('show', 3);
    });

    it('numbers the list from ((page - 1) * 30) + 1 and scrolls to the top', async () => {
        fetchFeedMock.mockResolvedValue(makeStories(30));

        const { container } = renderFeed('news', 2);

        await waitFor(() => expect(container.querySelector('ol')).toHaveAttribute('start', '31'));
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('hides Prev on the first page and shows More for a full page of 30 stories', async () => {
        fetchFeedMock.mockResolvedValue(makeStories(30));

        renderFeed('news', 1);

        await waitFor(() => expect(screen.getByRole('link', { name: 'More ›' })).toHaveAttribute('href', '/news/2'));
        expect(screen.queryByRole('link', { name: '‹ Prev' })).not.toBeInTheDocument();
    });

    it('shows Prev on later pages and hides More on a partial page', async () => {
        fetchFeedMock.mockResolvedValue(makeStories(12));

        renderFeed('newest', 4);

        await waitFor(() => expect(screen.getByRole('link', { name: '‹ Prev' })).toHaveAttribute('href', '/newest/3'));
        expect(screen.queryByRole('link', { name: 'More ›' })).not.toBeInTheDocument();
    });

    it('renders the Y Combinator blurb only for the jobs feed', async () => {
        fetchFeedMock.mockResolvedValue(makeStories(1));

        const { container } = renderFeed('jobs', 1);

        await waitFor(() => expect(screen.getByText(/These are jobs at startups/)).toBeInTheDocument());
        expect(container.querySelector('ol')).not.toHaveClass('list-margin');
    });

    it('adds the list-margin class for non-job feeds', async () => {
        fetchFeedMock.mockResolvedValue(makeStories(1));

        const { container } = renderFeed('ask', 1);

        await waitFor(() => expect(container.querySelector('ol')).toHaveClass('list-margin'));
        expect(screen.queryByText(/These are jobs at startups/)).not.toBeInTheDocument();
    });

    it('renders the error message when the feed request fails', async () => {
        fetchFeedMock.mockRejectedValue(new Error('offline'));

        renderFeed('news', 1);

        await waitFor(() => expect(screen.getByText('Could not load news stories.')).toBeInTheDocument());
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });
});
