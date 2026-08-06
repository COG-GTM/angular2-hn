import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FeedPage } from './FeedPage';
import { fetchFeed } from '../api/hackerNews';
import { SettingsProvider } from '../context/SettingsContext';
import { Story } from '../models/story';
import { stubMatchMedia } from '../testUtils/matchMedia';

vi.mock('../api/hackerNews');

const fetchFeedMock = vi.mocked(fetchFeed);

function makeStories(count: number, startId = 1): Story[] {
    return Array.from({ length: count }, (_, index) => ({
        id: startId + index,
        title: `Story ${startId + index}`,
        points: 10 + index,
        user: `user${startId + index}`,
        time: 1600000000,
        time_ago: '1 hour ago',
        type: 'story' as const,
        url: `https://example.com/${startId + index}`,
        domain: 'example.com',
        comments_count: index,
    }));
}

function renderFeed(feedType = 'news', path = `/${feedType}/1`) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <SettingsProvider>
                <Routes>
                    <Route path={`/${feedType}/:page`} element={<FeedPage feedType={feedType} />} />
                    <Route path={`/${feedType}`} element={<FeedPage feedType={feedType} />} />
                </Routes>
            </SettingsProvider>
        </MemoryRouter>
    );
}

beforeEach(() => {
    stubMatchMedia(false);
    vi.stubGlobal('scrollTo', vi.fn());
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
});

describe('FeedPage', () => {
    it('shows the loader while the feed is loading', () => {
        fetchFeedMock.mockReturnValue(new Promise(() => {}));

        renderFeed();

        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(fetchFeedMock).toHaveBeenCalledWith('news', 1);
    });

    it('renders the loaded stories and scrolls back to the top', async () => {
        fetchFeedMock.mockResolvedValue(makeStories(3));

        const { container } = renderFeed();

        expect(await screen.findByText('Story 1')).toBeInTheDocument();
        expect(screen.queryByText('Loading...')).toBeNull();
        expect(container.querySelectorAll('li.post')).toHaveLength(3);
        expect(container.querySelector('ol')).toHaveAttribute('start', '1');
        expect(container.querySelector('ol')).toHaveClass('list-margin');
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('continues the rank numbering on later pages', async () => {
        fetchFeedMock.mockResolvedValue(makeStories(30, 31));

        const { container } = renderFeed('news', '/news/2');

        await screen.findByText('Story 31');
        expect(fetchFeedMock).toHaveBeenCalledWith('news', 2);
        expect(container.querySelector('ol')).toHaveAttribute('start', '31');
    });

    it('defaults to page one when the route has no page parameter', async () => {
        fetchFeedMock.mockResolvedValue(makeStories(1));

        const { container } = renderFeed('news', '/news');

        await screen.findByText('Story 1');
        expect(fetchFeedMock).toHaveBeenCalledWith('news', 1);
        expect(container.querySelector('ol')).toHaveAttribute('start', '1');
    });

    it('shows an error message when the feed cannot be loaded', async () => {
        fetchFeedMock.mockRejectedValue(new Error('boom'));

        renderFeed('ask', '/ask/1');

        expect(await screen.findByText('Could not load ask stories.')).toBeInTheDocument();
        expect(screen.queryByText('Loading...')).toBeNull();
        expect(window.scrollTo).not.toHaveBeenCalled();
    });

    it('hides the previous link on the first page and shows More for a full page', async () => {
        fetchFeedMock.mockResolvedValue(makeStories(30));

        renderFeed();

        const more = await screen.findByRole('link', { name: 'More ›' });
        expect(more).toHaveAttribute('href', '/news/2');
        expect(more).toHaveClass('more');
        expect(screen.queryByRole('link', { name: '‹ Prev' })).toBeNull();
    });

    it('shows both pagination links on a full later page', async () => {
        fetchFeedMock.mockResolvedValue(makeStories(30, 61));

        renderFeed('news', '/news/3');

        const prev = await screen.findByRole('link', { name: '‹ Prev' });
        expect(prev).toHaveAttribute('href', '/news/2');
        expect(prev).toHaveClass('prev');
        expect(screen.getByRole('link', { name: 'More ›' })).toHaveAttribute('href', '/news/4');
    });

    it('hides the More link when the page is not full', async () => {
        fetchFeedMock.mockResolvedValue(makeStories(29, 31));

        renderFeed('news', '/news/2');

        await screen.findByRole('link', { name: '‹ Prev' });
        expect(screen.queryByRole('link', { name: 'More ›' })).toBeNull();
    });

    it('renders the jobs blurb and omits the list margin for the jobs feed', async () => {
        fetchFeedMock.mockResolvedValue(makeStories(2));

        const { container } = renderFeed('jobs', '/jobs/1');

        await screen.findByText(/These are jobs at startups/);
        expect(screen.getByRole('link', { name: 'Triplebyte' })).toHaveAttribute(
            'href',
            'https://triplebyte.com/?ref=yc_jobs'
        );
        expect(container.querySelector('.job-header')).toBeInTheDocument();
        expect(container.querySelector('ol')).not.toHaveClass('list-margin');
    });

    it('does not render the jobs blurb for other feeds', async () => {
        fetchFeedMock.mockResolvedValue(makeStories(2));

        const { container } = renderFeed('show', '/show/1');

        await screen.findByText('Story 1');
        expect(container.querySelector('.job-header')).toBeNull();
    });

    it('refetches the feed when navigating to the next page', async () => {
        fetchFeedMock.mockResolvedValueOnce(makeStories(30)).mockResolvedValueOnce(makeStories(30, 31));

        renderFeed();

        await screen.findByText('Story 1');
        await userEvent.click(screen.getByRole('link', { name: 'More ›' }));

        expect(await screen.findByText('Story 31')).toBeInTheDocument();
        await waitFor(() => expect(fetchFeedMock).toHaveBeenCalledTimes(2));
        expect(fetchFeedMock).toHaveBeenLastCalledWith('news', 2);
        expect(screen.queryByText('Story 1')).toBeNull();
    });

    it('ignores a feed that resolves after the page unmounted', async () => {
        const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
        let resolveFeed: (stories: Story[]) => void = () => {};
        fetchFeedMock.mockReturnValueOnce(
            new Promise<Story[]>((resolve) => {
                resolveFeed = resolve;
            })
        );

        const { unmount } = renderFeed();
        unmount();
        resolveFeed(makeStories(3));

        await waitFor(() => expect(scrollTo).not.toHaveBeenCalled());
        expect(screen.queryByText('Story 1')).toBeNull();
    });
});
