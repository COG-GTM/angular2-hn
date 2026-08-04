import { screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import { Story } from '../../shared/models';
import { fetchFeed } from '../../shared/services/hackernews-api';
import { renderWithProviders } from '../../test-utils';
import Feed from './Feed';

jest.mock('../../shared/services/hackernews-api', () => ({
    ...jest.requireActual('../../shared/services/hackernews-api'),
    fetchFeed: jest.fn(),
}));

const fetchFeedMock = fetchFeed as jest.MockedFunction<typeof fetchFeed>;

function makeStory(id: number): Story {
    return {
        id,
        title: `Story ${id}`,
        points: id,
        user: 'pg',
        time: 1600000000,
        time_ago: '2 hours ago',
        type: 'story',
        url: `https://example.com/${id}`,
        domain: 'example.com',
        comments_count: 2,
    };
}

function renderFeed(feedType: 'news' | 'jobs', page: number) {
    return renderWithProviders(
        <Routes>
            <Route path={`/${feedType}/:page`} element={<Feed feedType={feedType} />} />
        </Routes>,
        { route: `/${feedType}/${page}` }
    );
}

beforeEach(() => {
    fetchFeedMock.mockReset();
    window.scrollTo = jest.fn();
});

describe('Feed', () => {
    it('shows the loader and then the list of items', async () => {
        fetchFeedMock.mockResolvedValue([makeStory(1), makeStory(2)]);

        renderFeed('news', 1);

        expect(screen.getByText('Loading...')).toBeInTheDocument();

        expect(await screen.findByRole('link', { name: 'Story 1' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Story 2' })).toBeInTheDocument();
        expect(fetchFeedMock).toHaveBeenCalledWith('news', 1, expect.any(AbortSignal));
    });

    it('shows an error message when the feed cannot be loaded', async () => {
        fetchFeedMock.mockRejectedValue(new Error('boom'));

        renderFeed('news', 1);

        expect(await screen.findByText('Could not load news stories.')).toBeInTheDocument();
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('ignores aborted requests', async () => {
        fetchFeedMock.mockRejectedValue(new DOMException('Aborted', 'AbortError'));

        renderFeed('news', 1);

        await waitFor(() => expect(fetchFeedMock).toHaveBeenCalled());

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders the jobs header only for the jobs feed', async () => {
        fetchFeedMock.mockResolvedValue([makeStory(1)]);

        const { container, unmount } = renderFeed('jobs', 1);

        expect(await screen.findByText(/These are jobs at startups/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Triplebyte' })).toHaveAttribute(
            'href',
            'https://triplebyte.com/?ref=yc_jobs'
        );
        expect(container.querySelector('ol')).not.toHaveClass('list-margin');

        unmount();

        const news = renderFeed('news', 1);

        await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

        expect(screen.queryByText(/These are jobs at startups/)).not.toBeInTheDocument();
        expect(news.container.querySelector('ol')).toHaveClass('list-margin');
    });

    it('starts the list at the first item of the current page', async () => {
        fetchFeedMock.mockResolvedValue([makeStory(1)]);

        const { container } = renderFeed('news', 2);

        await waitFor(() => expect(container.querySelector('ol')).toBeInTheDocument());

        expect(container.querySelector('ol')).toHaveAttribute('start', '31');
        expect(fetchFeedMock).toHaveBeenCalledWith('news', 2, expect.any(AbortSignal));
    });

    it('hides the previous link on the first page and the more link with fewer than 30 items', async () => {
        fetchFeedMock.mockResolvedValue([makeStory(1)]);

        renderFeed('news', 1);

        expect(await screen.findByRole('link', { name: 'Story 1' })).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /Prev/ })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /More/ })).not.toBeInTheDocument();
    });

    it('shows the navigation links on a later page with a full list', async () => {
        fetchFeedMock.mockResolvedValue(Array.from({ length: 30 }, (_item, index) => makeStory(index + 1)));

        renderFeed('news', 2);

        expect(await screen.findByRole('link', { name: /Prev/ })).toHaveAttribute('href', '/news/1');
        expect(screen.getByRole('link', { name: /More/ })).toHaveAttribute('href', '/news/3');
    });
});
