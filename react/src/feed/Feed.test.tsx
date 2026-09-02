import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchFeed } from '../api/hackernews-api';
import type { Story } from '../models';
import { SettingsProvider } from '../settings';
import { mockMatchMedia } from '../test/matchMedia';
import { Feed } from './index';

vi.mock('../api/hackernews-api');

const mockedFetchFeed = vi.mocked(fetchFeed);

function makeStory(id: number): Story {
    return {
        id,
        title: `Story ${id}`,
        points: id,
        user: 'pg',
        time: 0,
        time_ago: '1 hour ago',
        type: 'story',
        url: `https://example.com/${id}`,
        domain: 'example.com',
        comments: [],
        comments_count: id,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
    } as unknown as Story;
}

function makeStories(count: number): Story[] {
    return Array.from({ length: count }, (_, i) => makeStory(i + 1));
}

function renderFeed(feedType: 'news' | 'jobs' = 'news', page = '1') {
    return render(
        <MemoryRouter initialEntries={[`/${feedType}/${page}`]}>
            <SettingsProvider>
                <Routes>
                    <Route path={`/${feedType}/:page`} element={<Feed feedType={feedType} />} />
                </Routes>
            </SettingsProvider>
        </MemoryRouter>
    );
}

describe('Feed', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        mockMatchMedia(false);
        vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    });

    it('shows the loader while the feed is loading', () => {
        mockedFetchFeed.mockReturnValue(new Promise(() => {}));
        const { container } = renderFeed();

        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(container.querySelector('ol')).toBeNull();
    });

    it('shows an error message naming the feed type when loading fails', async () => {
        mockedFetchFeed.mockRejectedValue(new Error('boom'));
        const { container } = renderFeed();

        expect(await screen.findByText('Could not load news stories.')).toBeInTheDocument();
        expect(container.querySelector('ol')).toBeNull();
    });

    it('renders the stories with start=1 and scrolls to the top on page 1', async () => {
        mockedFetchFeed.mockResolvedValue(makeStories(3));
        const { container } = renderFeed();

        await waitFor(() => expect(container.querySelector('ol')).not.toBeNull());
        expect(mockedFetchFeed).toHaveBeenCalledWith('news', 1, expect.any(AbortSignal));
        expect(container.querySelector('ol')).toHaveAttribute('start', '1');
        expect(container.querySelector('ol')).toHaveClass('list-margin');
        expect(container.querySelectorAll('li.post')).toHaveLength(3);
        expect(screen.getByRole('link', { name: 'Story 1' })).toBeInTheDocument();
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
        expect(container.querySelector('.prev')).toBeNull();
        expect(container.querySelector('.more')).toBeNull();
    });

    it('offsets the list start and shows Prev on later pages', async () => {
        mockedFetchFeed.mockResolvedValue(makeStories(3));
        const { container } = renderFeed('news', '3');

        await waitFor(() => expect(container.querySelector('ol')).not.toBeNull());
        expect(mockedFetchFeed).toHaveBeenCalledWith('news', 3, expect.any(AbortSignal));
        expect(container.querySelector('ol')).toHaveAttribute('start', '61');
        expect(screen.getByRole('link', { name: '‹ Prev' })).toHaveAttribute('href', '/news/2');
    });

    it('shows the More link only when the page is full with 30 items', async () => {
        mockedFetchFeed.mockResolvedValue(makeStories(30));
        const { container } = renderFeed('news', '2');

        await waitFor(() => expect(container.querySelector('ol')).not.toBeNull());
        expect(screen.getByRole('link', { name: 'More ›' })).toHaveAttribute('href', '/news/3');
        expect(screen.getByRole('link', { name: '‹ Prev' })).toHaveAttribute('href', '/news/1');
        expect(container.querySelectorAll('li.post')).toHaveLength(30);
    });

    it('hides the More link when the page has 29 items', async () => {
        mockedFetchFeed.mockResolvedValue(makeStories(29));
        const { container } = renderFeed('news', '2');

        await waitFor(() => expect(container.querySelector('ol')).not.toBeNull());
        expect(container.querySelector('.more')).toBeNull();
    });

    it('renders the jobs header and drops the list margin for the jobs feed', async () => {
        mockedFetchFeed.mockResolvedValue(makeStories(1));
        const { container } = renderFeed('jobs');

        await waitFor(() => expect(container.querySelector('ol')).not.toBeNull());
        const header = container.querySelector('.job-header');
        expect(header?.textContent).toContain('These are jobs at startups that were funded by Y Combinator.');
        expect(screen.getByRole('link', { name: 'Triplebyte' })).toHaveAttribute(
            'href',
            'https://triplebyte.com/?ref=yc_jobs'
        );
        expect(container.querySelector('ol')).not.toHaveClass('list-margin');
    });

    it('does not render the jobs header for other feeds', async () => {
        mockedFetchFeed.mockResolvedValue(makeStories(1));
        const { container } = renderFeed();

        await waitFor(() => expect(container.querySelector('ol')).not.toBeNull());
        expect(container.querySelector('.job-header')).toBeNull();
    });

    it('re-fetches when the route page changes', async () => {
        mockedFetchFeed.mockResolvedValue(makeStories(30));
        const { container } = renderFeed('news', '1');

        await waitFor(() => expect(container.querySelector('ol')).not.toBeNull());
        await userEvent.click(screen.getByRole('link', { name: 'More ›' }));

        await waitFor(() => expect(mockedFetchFeed).toHaveBeenCalledWith('news', 2, expect.any(AbortSignal)));
        await waitFor(() => expect(container.querySelector('ol')).toHaveAttribute('start', '31'));
    });

    it('defaults to page 1 when the route has no page param', async () => {
        mockedFetchFeed.mockResolvedValue(makeStories(1));
        render(
            <MemoryRouter initialEntries={['/news']}>
                <SettingsProvider>
                    <Routes>
                        <Route path="/news" element={<Feed feedType="news" />} />
                    </Routes>
                </SettingsProvider>
            </MemoryRouter>
        );

        await waitFor(() => expect(mockedFetchFeed).toHaveBeenCalledWith('news', 1, expect.any(AbortSignal)));
    });

    it('ignores a resolved response after unmount', async () => {
        let resolveFeed: (stories: Story[]) => void = () => {};
        mockedFetchFeed.mockReturnValue(
            new Promise<Story[]>((resolve) => {
                resolveFeed = resolve;
            })
        );
        const { unmount } = renderFeed();
        unmount();
        resolveFeed(makeStories(3));

        await waitFor(() => expect(window.scrollTo).not.toHaveBeenCalled());
        expect(screen.queryByRole('link', { name: 'Story 1' })).toBeNull();
    });

    it('ignores a rejected request after unmount', async () => {
        let rejectFeed: (reason: Error) => void = () => {};
        mockedFetchFeed.mockReturnValue(
            new Promise<Story[]>((_, reject) => {
                rejectFeed = reject;
            })
        );
        const { unmount } = renderFeed();
        unmount();
        rejectFeed(new Error('aborted'));

        await waitFor(() => expect(screen.queryByText('Could not load news stories.')).toBeNull());
    });
});
