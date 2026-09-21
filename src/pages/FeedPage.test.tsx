import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as api from '../api/hackernews';
import { SettingsProvider } from '../context';
import type { Story } from '../models';
import { FeedPage } from './FeedPage';

function makeStories(count: number, offset = 0): Story[] {
    return Array.from({ length: count }, (_, index) => ({
        id: offset + index + 1,
        title: `Story ${offset + index + 1}`,
        points: 10,
        user: 'pg',
        time: 0,
        time_ago: '1 hour ago',
        type: 'story',
        url: `https://example.com/${offset + index + 1}`,
        domain: 'example.com',
        comments: [],
        comments_count: 1,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
    }));
}

function renderFeed(feedType: string, page: string) {
    return render(
        <MemoryRouter initialEntries={[`/${feedType}/${page}`]}>
            <SettingsProvider>
                <Routes>
                    <Route path="/:feedType/:page" element={<FeedPage feedType={feedType} />} />
                </Routes>
            </SettingsProvider>
        </MemoryRouter>
    );
}

beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('scrollTo', vi.fn());
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

describe('FeedPage', () => {
    it('shows the loader until the feed resolves', async () => {
        vi.spyOn(api, 'fetchFeed').mockResolvedValue(makeStories(2));

        const { container } = renderFeed('news', '1');
        expect(container.querySelector('.loading-section')).toBeInTheDocument();

        expect(await screen.findByText('Story 1')).toBeInTheDocument();
        expect(container.querySelector('.loading-section')).not.toBeInTheDocument();
    });

    it('requests the feed type and page from the route and scrolls to the top', async () => {
        const fetchFeed = vi.spyOn(api, 'fetchFeed').mockResolvedValue(makeStories(30, 30));

        const { container } = renderFeed('show', '2');
        await screen.findByText('Story 31');

        expect(fetchFeed).toHaveBeenCalledWith('show', 2, expect.any(AbortSignal));
        expect(container.querySelector('ol')).toHaveAttribute('start', '31');
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('renders prev and more links based on the page and result count', async () => {
        vi.spyOn(api, 'fetchFeed').mockResolvedValue(makeStories(30, 30));

        renderFeed('news', '2');
        await screen.findByText('Story 31');

        expect(screen.getByRole('link', { name: '‹ Prev' })).toHaveAttribute('href', '/news/1');
        expect(screen.getByRole('link', { name: 'More ›' })).toHaveAttribute('href', '/news/3');
    });

    it('omits prev on the first page and more on a short page', async () => {
        vi.spyOn(api, 'fetchFeed').mockResolvedValue(makeStories(5));

        renderFeed('news', '1');
        await screen.findByText('Story 1');

        expect(screen.queryByRole('link', { name: '‹ Prev' })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'More ›' })).not.toBeInTheDocument();
    });

    it('shows the jobs header and drops the list margin for jobs', async () => {
        vi.spyOn(api, 'fetchFeed').mockResolvedValue(makeStories(1));

        const { container } = renderFeed('jobs', '1');
        await screen.findByText('Story 1');

        expect(screen.getByText(/These are jobs at startups/)).toHaveClass('job-header');
        expect(container.querySelector('ol')).not.toHaveClass('list-margin');
    });

    it('shows a feed specific error message when the request fails', async () => {
        vi.spyOn(api, 'fetchFeed').mockRejectedValue(new Error('offline'));

        renderFeed('ask', '1');

        expect(await screen.findByText('Could not load ask stories.')).toBeInTheDocument();
    });

    it('refetches when navigating to another page', async () => {
        const fetchFeed = vi.spyOn(api, 'fetchFeed').mockResolvedValue(makeStories(30));
        const user = userEvent.setup();

        renderFeed('news', '1');
        await screen.findByText('Story 1');

        fetchFeed.mockResolvedValue(makeStories(2, 30));
        await user.click(screen.getByRole('link', { name: 'More ›' }));

        await waitFor(() => expect(fetchFeed).toHaveBeenLastCalledWith('news', 2, expect.any(AbortSignal)));
        expect(await screen.findByText('Story 31')).toBeInTheDocument();
    });
});
