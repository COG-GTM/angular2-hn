import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Story } from '../../shared/models/story';
import { SettingsProvider } from '../../shared/services/settingsContext';
import { fetchFeed } from '../../shared/services/hackerNewsApi';
import Feed from './Feed';

vi.mock('../../shared/services/hackerNewsApi', () => ({
    fetchFeed: vi.fn(),
}));

const fetchFeedMock = vi.mocked(fetchFeed);

function makeStory(id: number): Story {
    return {
        id,
        title: `Story ${id}`,
        points: id,
        user: `user${id}`,
        time: 1600000000,
        time_ago: '1 hour ago',
        type: 'link',
        url: `https://example.com/${id}`,
        domain: 'example.com',
        comments: [],
        comments_count: 0,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
    } as unknown as Story;
}

function makeStories(count: number): Story[] {
    return Array.from({ length: count }, (_, index) => makeStory(index + 1));
}

function renderFeed(initialEntry: string) {
    return render(
        <SettingsProvider>
            <MemoryRouter initialEntries={[initialEntry]}>
                <Routes>
                    <Route path="/:feedType" element={<Feed />} />
                    <Route path="/:feedType/:page" element={<Feed />} />
                </Routes>
            </MemoryRouter>
        </SettingsProvider>
    );
}

describe('Feed', () => {
    beforeEach(() => {
        vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
        vi.stubGlobal(
            'matchMedia',
            vi.fn().mockImplementation((media: string) => ({
                media,
                matches: false,
                addEventListener: () => {},
                removeEventListener: () => {},
            }))
        );
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('shows the loader while the request is pending', () => {
        fetchFeedMock.mockReturnValue(new Promise<Story[]>(() => {}));

        renderFeed('/news/1');

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders the stories and requests the feed type and page from the URL', async () => {
        fetchFeedMock.mockResolvedValue(makeStories(3));

        const { container } = renderFeed('/ask/2');

        expect(await screen.findByText('Story 1')).toBeInTheDocument();
        expect(container.querySelectorAll('li.post')).toHaveLength(3);
        expect(fetchFeedMock).toHaveBeenCalledWith('ask', 2, expect.any(AbortSignal));
    });

    it('shows the error message when the request fails', async () => {
        fetchFeedMock.mockRejectedValue(new Error('boom'));

        renderFeed('/news/1');

        expect(await screen.findByText('Could not load news stories.')).toBeInTheDocument();
    });

    it('starts the list at 1 on page 1 and scrolls to the top', async () => {
        fetchFeedMock.mockResolvedValue(makeStories(2));

        const { container } = renderFeed('/news/1');

        await screen.findByText('Story 1');
        expect(container.querySelector('ol')).toHaveAttribute('start', '1');
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('starts the list at 61 on page 3', async () => {
        fetchFeedMock.mockResolvedValue(makeStories(2));

        const { container } = renderFeed('/news/3');

        await screen.findByText('Story 1');
        expect(container.querySelector('ol')).toHaveAttribute('start', '61');
    });

    it('adds the list-margin class for news and omits the job header', async () => {
        fetchFeedMock.mockResolvedValue(makeStories(1));

        const { container } = renderFeed('/news/1');

        await screen.findByText('Story 1');
        expect(container.querySelector('ol')).toHaveClass('list-margin');
        expect(container.querySelector('.job-header')).toBeNull();
    });

    it('omits the list-margin class for jobs and renders the job header', async () => {
        fetchFeedMock.mockResolvedValue(makeStories(1));

        const { container } = renderFeed('/jobs/1');

        await screen.findByText('Story 1');
        expect(container.querySelector('ol')).not.toHaveClass('list-margin');
        expect(container.querySelector('.job-header')).not.toBeNull();
        expect(screen.getByRole('link', { name: 'Triplebyte' })).toHaveAttribute(
            'href',
            'https://triplebyte.com/?ref=yc_jobs'
        );
    });

    it('does not render the list for the new feed', async () => {
        fetchFeedMock.mockResolvedValue(makeStories(1));

        const { container } = renderFeed('/new/1');

        await waitFor(() => expect(container.querySelector('.nav')).not.toBeNull());
        expect(container.querySelector('ol')).toBeNull();
    });

    it('hides the Prev link on page 1 and shows More only with 30 items', async () => {
        fetchFeedMock.mockResolvedValue(makeStories(30));

        renderFeed('/news/1');

        await screen.findByText('Story 1');
        expect(screen.queryByText('‹ Prev')).toBeNull();
        expect(screen.getByText('More ›')).toHaveAttribute('href', '/news/2');
    });

    it('shows the Prev link on page 2 and hides More with fewer than 30 items', async () => {
        fetchFeedMock.mockResolvedValue(makeStories(29));

        renderFeed('/news/2');

        await screen.findByText('Story 1');
        expect(screen.getByText('‹ Prev')).toHaveAttribute('href', '/news/1');
        expect(screen.queryByText('More ›')).toBeNull();
    });

    it('refetches when the page param changes', async () => {
        fetchFeedMock.mockResolvedValue(makeStories(30));

        renderFeed('/news/1');

        await screen.findByText('Story 1');
        expect(fetchFeedMock).toHaveBeenCalledWith('news', 1, expect.any(AbortSignal));

        await userEvent.click(screen.getByText('More ›'));

        await waitFor(() => expect(fetchFeedMock).toHaveBeenCalledWith('news', 2, expect.any(AbortSignal)));
    });
});
