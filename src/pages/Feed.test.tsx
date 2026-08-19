import { beforeEach, describe, expect, it, vi } from 'vitest';

import Feed from './Feed';
import { fetchFeed } from '../api/hackerNewsApi';
import { feed } from '../test/fixtures';
import { renderWithProviders, screen } from '../test/renderWithProviders';

vi.mock('../api/hackerNewsApi', () => ({
    fetchFeed: vi.fn(),
}));

const fetchFeedMock = vi.mocked(fetchFeed);

function renderFeed(feedType = 'news', page = '1') {
    return renderWithProviders(<Feed feedType={feedType} />, {
        initialEntries: [`/${feedType}/${page}`],
        routePath: `/${feedType}/:page`,
    });
}

describe('Feed', () => {
    beforeEach(() => {
        fetchFeedMock.mockReset();
    });

    it('renders an item for every story returned by the api', async () => {
        fetchFeedMock.mockResolvedValue(feed);

        renderFeed();

        expect(await screen.findByText(feed[0].title)).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(feed.length);
        expect(fetchFeedMock).toHaveBeenCalledWith('news', 1);
    });

    it('requests the page from the route params', async () => {
        fetchFeedMock.mockResolvedValue(feed);

        renderFeed('ask', '3');

        expect(await screen.findByText(feed[0].title)).toBeInTheDocument();
        expect(fetchFeedMock).toHaveBeenCalledWith('ask', 3);
    });

    it('shows an error message when the api rejects', async () => {
        fetchFeedMock.mockRejectedValue(new Error('offline'));

        renderFeed('show');

        expect(await screen.findByText('Could not load show stories.')).toBeInTheDocument();
    });
});
