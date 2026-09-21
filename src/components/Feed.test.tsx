import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Feed } from './Feed';
import type { Story } from '../models';
import { renderWithProviders, mockMatchMedia } from '../test/utils';

function story(id: number, overrides: Partial<Story> = {}): Story {
    return {
        id,
        title: `Story ${id}`,
        points: 10,
        user: 'pg',
        time: 1600000000,
        time_ago: '1 hour ago' as unknown as number,
        type: 'story',
        url: `https://example.com/${id}`,
        domain: 'example.com',
        comments: [],
        comments_count: 2,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
        ...overrides,
    };
}

function stories(count: number) {
    return Array.from({ length: count }, (_, index) => story(index + 1));
}

function mockFetch(response: Story[] | Error) {
    const fetchMock = vi.fn(() =>
        response instanceof Error
            ? Promise.reject(response)
            : Promise.resolve({ json: () => Promise.resolve(response) } as Response)
    );
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

function renderFeed(route: string) {
    return renderWithProviders(
        <Routes>
            <Route path="/:feedType/:page" element={<Feed />} />
        </Routes>,
        { route }
    );
}

beforeEach(() => {
    localStorage.clear();
    mockMatchMedia(false);
    vi.stubGlobal('scrollTo', vi.fn());
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('Feed', () => {
    it('shows the loader until the stories arrive', async () => {
        mockFetch(stories(3));
        const { container } = renderFeed('/news/1');

        expect(container.querySelector('.loader')).toBeInTheDocument();
        expect(await screen.findByText('Story 1')).toBeInTheDocument();
        expect(container.querySelector('.loader')).not.toBeInTheDocument();
        expect(container.querySelectorAll('li.post')).toHaveLength(3);
    });

    it('requests the feed type and page from the route', async () => {
        const fetchMock = mockFetch(stories(1));
        renderFeed('/show/2');

        await screen.findByText('Story 1');
        expect(fetchMock).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/show?page=2');
    });

    it('scrolls to the top once loaded', async () => {
        mockFetch(stories(1));
        renderFeed('/news/1');

        await screen.findByText('Story 1');
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('shows an error message when the request fails', async () => {
        mockFetch(new Error('offline'));
        renderFeed('/ask/1');

        expect(await screen.findByText('Could not load ask stories.')).toBeInTheDocument();
    });

    it('numbers the list from the page offset', async () => {
        mockFetch(stories(30));
        const { container } = renderFeed('/news/3');

        await screen.findByText('Story 1');
        expect(container.querySelector('ol')).toHaveAttribute('start', '61');
    });

    it('hides the prev link on the first page and links to the next page', async () => {
        mockFetch(stories(30));
        renderFeed('/news/1');

        await screen.findByText('Story 1');
        expect(screen.queryByText('‹ Prev')).not.toBeInTheDocument();
        expect(screen.getByText('More ›')).toHaveAttribute('href', '/news/2');
    });

    it('shows the prev link and hides more on a short last page', async () => {
        mockFetch(stories(12));
        renderFeed('/news/2');

        await screen.findByText('Story 1');
        expect(screen.getByText('‹ Prev')).toHaveAttribute('href', '/news/1');
        expect(screen.queryByText('More ›')).not.toBeInTheDocument();
    });

    it('renders the job header and drops the list margin for the jobs feed', async () => {
        mockFetch([story(1, { type: 'job', comments_count: 0 })]);
        const { container } = renderFeed('/jobs/1');

        expect(await screen.findByText(/These are jobs at startups/)).toBeInTheDocument();
        expect(container.querySelector('ol')).not.toHaveClass('list-margin');
    });

    it('re-fetches when the page changes', async () => {
        const fetchMock = mockFetch(stories(30));
        renderFeed('/news/1');

        await screen.findByText('Story 1');
        await userEvent.click(screen.getByText('More ›'));

        await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/news?page=2'));
    });
});
