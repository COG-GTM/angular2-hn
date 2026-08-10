import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Story } from '../shared/models';
import { SettingsProvider } from '../shared/settings/SettingsProvider';
import { Feed } from './Feed';

vi.mock('../shared/api/hackernews', () => ({
    fetchFeed: vi.fn(),
}));

const { fetchFeed } = await import('../shared/api/hackernews');

function story(id: number): Story {
    return {
        id,
        title: `Story ${id}`,
        points: 10,
        user: 'pg',
        time: 0,
        time_ago: '1 hour ago',
        type: 'story',
        url: `https://example.com/${id}`,
        domain: 'example.com',
        content: '',
        text: '',
        comments: [],
        comments_count: 2,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
    };
}

function renderFeed(page: string) {
    return render(
        <SettingsProvider>
            <MemoryRouter initialEntries={[`/news/${page}`]}>
                <Routes>
                    <Route path="/news/:page" element={<Feed feedType="news" pageNum={+page} />} />
                </Routes>
            </MemoryRouter>
        </SettingsProvider>
    );
}

afterEach(() => {
    vi.mocked(fetchFeed).mockReset();
});

describe('Feed', () => {
    it('renders stories returned for the route page', async () => {
        vi.mocked(fetchFeed).mockResolvedValue([story(1), story(2)]);

        renderFeed('2');

        expect(await screen.findByText('Story 1')).toBeInTheDocument();
        expect(fetchFeed).toHaveBeenCalledWith('news', 2, expect.any(AbortSignal));
        expect(screen.getByRole('list')).toHaveAttribute('start', '31');
    });

    it('shows an error message when the request fails', async () => {
        vi.mocked(fetchFeed).mockRejectedValue(new Error('offline'));

        renderFeed('1');

        expect(await screen.findByText('Could not load news stories.')).toBeInTheDocument();
    });
});
