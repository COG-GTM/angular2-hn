import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SettingsProvider } from '../context/SettingsContext';
import Feed from '../components/Feed';
import * as api from '../api/hackerNews';

vi.mock('../api/hackerNews');

const mockStories = [
    {
        id: 1,
        title: 'Story One',
        points: 10,
        user: 'user1',
        time: 123,
        time_ago: '1h',
        type: 'story' as const,
        url: 'https://example.com',
        domain: 'example.com',
        content: '',
        comments: [],
        comments_count: 3,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
    },
];

beforeEach(() => {
    vi.mocked(api.fetchFeed).mockResolvedValue(mockStories);
});

function renderFeed(path = '/news/1') {
    return render(
        <SettingsProvider>
            <MemoryRouter initialEntries={[path]}>
                <Routes>
                    <Route path="/:feed/:page" element={<Feed feedType="news" />} />
                </Routes>
            </MemoryRouter>
        </SettingsProvider>
    );
}

describe('Feed', () => {
    it('shows loader initially then renders items', async () => {
        renderFeed();
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByText('Story One')).toBeInTheDocument();
        });
    });

    it('shows error message on fetch failure', async () => {
        vi.mocked(api.fetchFeed).mockRejectedValueOnce(new Error('Network error'));
        renderFeed();
        await waitFor(() => {
            expect(screen.getByText(/Could not load/)).toBeInTheDocument();
        });
    });

    it('renders job header for jobs feed', async () => {
        render(
            <SettingsProvider>
                <MemoryRouter initialEntries={['/jobs/1']}>
                    <Routes>
                        <Route path="/:feed/:page" element={<Feed feedType="jobs" />} />
                    </Routes>
                </MemoryRouter>
            </SettingsProvider>
        );
        await waitFor(() => {
            expect(screen.getByText(/Y Combinator/)).toBeInTheDocument();
        });
    });
});
