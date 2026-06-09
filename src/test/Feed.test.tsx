import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Feed from '../pages/Feed';
import { SettingsProvider } from '../context/SettingsContext';

const mockStories = [
    {
        id: 1,
        title: 'Test Story',
        points: 100,
        user: 'testuser',
        time: 1234567890,
        time_ago: '3 hours ago',
        type: 'story' as const,
        url: 'https://example.com',
        domain: 'example.com',
        comments: [],
        comments_count: 5,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
        content: '',
        text: '',
    },
];

beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        json: () => Promise.resolve(mockStories),
    } as Response);
});

function renderFeed(feedType: string, page = '1') {
    return render(
        <SettingsProvider>
            <MemoryRouter initialEntries={[`/${feedType}/${page}`]}>
                <Routes>
                    <Route path="/:type/:page" element={<Feed feedType={feedType} />} />
                </Routes>
            </MemoryRouter>
        </SettingsProvider>
    );
}

describe('Feed', () => {
    it('renders loading state initially', () => {
        renderFeed('news');
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders stories after loading', async () => {
        renderFeed('news');
        await waitFor(() => {
            expect(screen.getByText('Test Story')).toBeInTheDocument();
        });
    });

    it('renders job header for jobs feed', async () => {
        renderFeed('jobs');
        await waitFor(() => {
            expect(screen.getByText(/Y Combinator/)).toBeInTheDocument();
        });
    });
});
