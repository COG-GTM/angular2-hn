import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Feed from '../Feed';
import { SettingsProvider } from '../../../context/SettingsContext';
import type { Story } from '../../../models/story';

const useFeed = vi.hoisted(() => vi.fn());

vi.mock('../../../hooks/useHackerNews', () => ({ useFeed }));

function makeStory(id: number): Story {
    return {
        id,
        title: `Story ${id}`,
        points: 10,
        user: 'pg',
        time: 1,
        time_ago: '1 hour ago',
        type: 'story',
        url: `https://example.com/${id}`,
        domain: 'example.com',
        comments: [],
        comments_count: 3,
    };
}

function renderFeed(page: string) {
    return render(
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
            <SettingsProvider>
                <MemoryRouter initialEntries={[`/news/${page}`]}>
                    <Routes>
                        <Route path="/news/:page" element={<Feed feedType="news" />} />
                    </Routes>
                </MemoryRouter>
            </SettingsProvider>
        </QueryClientProvider>
    );
}

describe('Feed', () => {
    beforeEach(() => {
        useFeed.mockReset();
        window.scrollTo = vi.fn();
    });

    it('renders the loader while the feed is pending', () => {
        useFeed.mockReturnValue({ data: undefined, isPending: true, isError: false, error: null });

        renderFeed('1');

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders the error message when the feed fails', () => {
        useFeed.mockReturnValue({ data: undefined, isPending: false, isError: true, error: new Error('boom') });

        renderFeed('1');

        expect(screen.getByText('Could not load news stories.')).toBeInTheDocument();
    });

    it('renders the items with the page 2 list offset', () => {
        const items = Array.from({ length: 30 }, (_, index) => makeStory(index + 1));
        useFeed.mockReturnValue({ data: items, isPending: false, isError: false, error: null });

        const { container } = renderFeed('2');

        expect(useFeed).toHaveBeenCalledWith('news', 2);
        expect(container.querySelector('ol')).toHaveAttribute('start', '31');
        expect(screen.getAllByRole('listitem')).toHaveLength(30);
        expect(screen.getByText('Story 1')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: '‹ Prev' })).toHaveAttribute('href', '/news/1');
        expect(screen.getByRole('link', { name: 'More ›' })).toHaveAttribute('href', '/news/3');
    });
});
