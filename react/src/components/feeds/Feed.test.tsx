import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Story } from '../../models';
import { SettingsProvider } from '../../settings/SettingsContext';
import { Feed } from './Feed';

const { fetchFeed } = vi.hoisted(() => ({ fetchFeed: vi.fn() }));

vi.mock('../../api/hackerNewsApi', () => ({
    fetchFeed,
    fetchItemContent: vi.fn(),
    fetchUser: vi.fn(),
    fetchPollContent: vi.fn(),
}));

function story(id: number): Story {
    return {
        id,
        title: `Story ${id}`,
        points: id,
        user: 'pg',
        time: 1600000000,
        time_ago: '1 hour ago',
        type: 'story',
        url: `https://example.com/${id}`,
        domain: 'example.com',
        comments: [],
        comments_count: 1,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
    };
}

function renderFeed(path: string) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <SettingsProvider>
                <Routes>
                    <Route path="/:feed/:page" element={<Feed />} />
                </Routes>
            </SettingsProvider>
        </MemoryRouter>
    );
}

describe('Feed', () => {
    beforeEach(() => {
        window.scrollTo = vi.fn();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it('shows the loader while the feed is in flight, as *ngIf="!items && !errorMessage" did', () => {
        fetchFeed.mockReturnValue(new Promise(() => {}));
        const { container } = renderFeed('/news/1');

        expect(container.querySelector('.loader')).toBeInTheDocument();
        expect(container.querySelector('ol')).toBeNull();
    });

    it('fetches the feed named by the route and renders one item per story', async () => {
        fetchFeed.mockResolvedValue([story(1), story(2)]);
        const { container } = renderFeed('/show/2');

        await waitFor(() => expect(container.querySelectorAll('li.post')).toHaveLength(2));
        expect(fetchFeed).toHaveBeenCalledWith('show', 2, expect.anything());
        expect(screen.getByRole('link', { name: 'Story 1' })).toBeInTheDocument();
    });

    it('keeps the rank numbering going across pages', async () => {
        fetchFeed.mockResolvedValue([story(1)]);
        const { container } = renderFeed('/news/3');

        await waitFor(() => expect(container.querySelector('ol')).toHaveAttribute('start', '61'));
    });

    it('renders the error message the Angular component built on failure', async () => {
        fetchFeed.mockRejectedValue(new Error('offline'));
        renderFeed('/newest/1');

        expect(await screen.findByText('Could not load newest stories.')).toBeInTheDocument();
    });

    it('renders More but no Prev on the first page, and both once past it', async () => {
        const page = Array.from({ length: 30 }, (_, index) => story(index + 1));
        fetchFeed.mockResolvedValue(page);
        const first = renderFeed('/news/1');

        await waitFor(() => expect(screen.getByRole('link', { name: 'More ›' })).toHaveAttribute('href', '/news/2'));
        expect(screen.queryByRole('link', { name: '‹ Prev' })).toBeNull();
        first.unmount();

        renderFeed('/news/2');
        await waitFor(() => expect(screen.getByRole('link', { name: '‹ Prev' })).toHaveAttribute('href', '/news/1'));
        expect(screen.getByRole('link', { name: 'More ›' })).toHaveAttribute('href', '/news/3');
    });

    it('hides More on a short page', async () => {
        fetchFeed.mockResolvedValue([story(1)]);
        renderFeed('/news/1');

        await waitFor(() => expect(screen.getByRole('list')).toBeInTheDocument());
        expect(screen.queryByRole('link', { name: 'More ›' })).toBeNull();
    });

    it('renders the Y Combinator blurb and drops list-margin on the jobs feed only', async () => {
        fetchFeed.mockResolvedValue([story(1)]);
        const jobs = renderFeed('/jobs/1');

        await waitFor(() => expect(jobs.container.querySelector('.job-header')).toBeInTheDocument());
        expect(screen.getByRole('link', { name: 'Triplebyte' })).toHaveAttribute(
            'href',
            'https://triplebyte.com/?ref=yc_jobs'
        );
        expect(jobs.container.querySelector('ol')).not.toHaveClass('list-margin');
        jobs.unmount();

        const news = renderFeed('/news/1');
        await waitFor(() => expect(news.container.querySelector('ol')).toHaveClass('list-margin'));
        expect(news.container.querySelector('.job-header')).toBeNull();
    });

    it('scrolls back to the top once the feed has loaded', async () => {
        fetchFeed.mockResolvedValue([story(1)]);
        renderFeed('/news/2');

        await waitFor(() => expect(window.scrollTo).toHaveBeenCalledWith(0, 0));
    });
});
