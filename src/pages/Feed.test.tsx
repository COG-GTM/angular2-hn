import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsProvider } from '../context/SettingsContext';
import type { Story } from '../models/story';
import Feed from './Feed';

function makeStory(id: number): Story {
    return {
        id,
        title: `Story ${id}`,
        points: 1,
        user: 'pg',
        time: 0,
        time_ago: '1 hour ago',
        type: 'story',
        url: `https://example.com/${id}`,
        domain: 'example.com',
        content: '',
        text: '',
        comments: [],
        comments_count: 0,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
    };
}

function stubFetch(response: Story[] | Error) {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => {
        if (response instanceof Error) {
            throw response;
        }
        return { ok: true, status: 200, json: async () => response } as Response;
    });

    vi.stubGlobal('fetch', fetchMock);

    return fetchMock;
}

function renderFeed(path: string) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <SettingsProvider>
                <Routes>
                    <Route path=":feedType/:page" element={<Feed />} />
                </Routes>
            </SettingsProvider>
        </MemoryRouter>
    );
}

beforeEach(() => localStorage.clear());
afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

describe('Feed', () => {
    it('shows the loader, then the fetched stories for the route params', async () => {
        const fetchMock = stubFetch([makeStory(1), makeStory(2)]);
        const { container } = renderFeed('/news/2');

        expect(container.querySelector('.loader')).toBeTruthy();
        expect(fetchMock.mock.calls[0][0]).toBe('https://node-hnapi.herokuapp.com/news?page=2');

        await waitFor(() => expect(screen.getByText('Story 1')).toBeTruthy());
        expect(container.querySelector('ol')?.getAttribute('start')).toBe('31');
    });

    it('renders a Prev link only past the first page and More only on a full page', async () => {
        stubFetch(Array.from({ length: 30 }, (_, index) => makeStory(index + 1)));
        renderFeed('/news/2');

        await waitFor(() => expect(screen.getByText('‹ Prev').getAttribute('href')).toBe('/news/1'));
        expect(screen.getByText('More ›').getAttribute('href')).toBe('/news/3');
    });

    it('hides pagination links on a short first page', async () => {
        stubFetch([makeStory(1)]);
        renderFeed('/news/1');

        await waitFor(() => expect(screen.getByText('Story 1')).toBeTruthy());
        expect(screen.queryByText('‹ Prev')).toBeNull();
        expect(screen.queryByText('More ›')).toBeNull();
    });

    it('renders the jobs header and drops the list margin for the jobs feed', async () => {
        stubFetch([makeStory(1)]);
        const { container } = renderFeed('/jobs/1');

        await waitFor(() => expect(screen.getByText(/These are jobs at startups/)).toBeTruthy());
        expect(container.querySelector('ol')?.className).toBe('');
    });

    it('shows a feed specific error message when the request fails', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        stubFetch(new Error('offline'));
        renderFeed('/show/1');

        await waitFor(() => expect(screen.getByText('Could not load show stories.')).toBeTruthy());
    });
});
