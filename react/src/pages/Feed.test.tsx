// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Story } from '../models';
import Feed from './Feed';

vi.mock('../api/hackernews', () => ({
    fetchFeed: vi.fn(),
}));

import { fetchFeed } from '../api/hackernews';

const mockedFetchFeed = vi.mocked(fetchFeed);

function makeStory(id: number): Story {
    return {
        id,
        title: `Story ${id}`,
        points: 1,
        user: 'user',
        time: 0,
        time_ago: '1 hour ago',
        comments_count: 0,
        type: 'link',
        url: `https://example.com/${id}`,
        domain: 'example.com',
        comments: [],
        content: '',
        poll: [],
        poll_votes_count: 0,
        dead: false,
        deleted: false,
        level: 0,
    } as unknown as Story;
}

function renderFeed(path: string) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route path='/:feedType/:page' element={<Feed />} />
            </Routes>
        </MemoryRouter>
    );
}

describe('Feed', () => {
    beforeEach(() => {
        window.scrollTo = vi.fn();
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('shows a loader while stories are loading', () => {
        mockedFetchFeed.mockReturnValue(new Promise(() => {}));
        const { container } = renderFeed('/news/1');
        expect(container.querySelector('.loader')).not.toBeNull();
    });

    it('renders stories in an ordered list with correct start', async () => {
        mockedFetchFeed.mockResolvedValue([makeStory(1), makeStory(2)]);
        renderFeed('/news/2');

        await waitFor(() => {
            expect(screen.getByText('Story 1')).not.toBeNull();
        });
        expect(mockedFetchFeed).toHaveBeenCalledWith('news', 2);
        const list = document.querySelector('ol');
        expect(list?.getAttribute('start')).toBe('31');
        expect(list?.className).toContain('list-margin');
    });

    it('shows an error message when the feed fails to load', async () => {
        mockedFetchFeed.mockRejectedValue(new Error('boom'));
        renderFeed('/news/1');

        await waitFor(() => {
            expect(screen.getByText('Could not load news stories.')).not.toBeNull();
        });
    });

    it('shows the jobs blurb for the jobs feed', async () => {
        mockedFetchFeed.mockResolvedValue([makeStory(1)]);
        renderFeed('/jobs/1');

        await waitFor(() => {
            expect(screen.getByText('Triplebyte')).not.toBeNull();
        });
        expect(document.querySelector('ol')?.className).not.toContain('list-margin');
    });

    it('renders Prev and More navigation links appropriately', async () => {
        mockedFetchFeed.mockResolvedValue(
            Array.from({ length: 30 }, (_, i) => makeStory(i + 1))
        );
        renderFeed('/news/2');

        await waitFor(() => {
            expect(screen.getByText('Story 1')).not.toBeNull();
        });
        const prev = document.querySelector('a.prev');
        const more = document.querySelector('a.more');
        expect(prev?.getAttribute('href')).toBe('/news/1');
        expect(more?.getAttribute('href')).toBe('/news/3');
    });

    it('hides Prev on the first page and More when fewer than 30 items', async () => {
        mockedFetchFeed.mockResolvedValue([makeStory(1)]);
        renderFeed('/news/1');

        await waitFor(() => {
            expect(screen.getByText('Story 1')).not.toBeNull();
        });
        expect(document.querySelector('a.prev')).toBeNull();
        expect(document.querySelector('a.more')).toBeNull();
    });
});
