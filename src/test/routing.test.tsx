import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { SettingsProvider } from '../context/SettingsContext';
import App from '../App';
import Feed from '../components/Feed';
import * as api from '../api/hackerNews';

vi.mock('../api/hackerNews');

const mockStories = [
    {
        id: 1,
        title: 'Routed Story',
        points: 10,
        user: 'u1',
        time: 123,
        time_ago: '1h',
        type: 'story' as const,
        url: 'https://example.com',
        domain: 'example.com',
        content: '',
        comments: [],
        comments_count: 0,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
    },
];

beforeEach(() => {
    vi.mocked(api.fetchFeed).mockResolvedValue(mockStories);
});

function renderWithRouter(initialPath: string) {
    const router = createMemoryRouter(
        [
            {
                path: '/',
                element: <App />,
                children: [
                    { path: 'news/:page', element: <Feed feedType="news" /> },
                    { path: 'newest/:page', element: <Feed feedType="newest" /> },
                    { path: 'show/:page', element: <Feed feedType="show" /> },
                    { path: 'ask/:page', element: <Feed feedType="ask" /> },
                    { path: 'jobs/:page', element: <Feed feedType="jobs" /> },
                ],
            },
        ],
        { initialEntries: [initialPath] }
    );

    return render(
        <SettingsProvider>
            <RouterProvider router={router} />
        </SettingsProvider>
    );
}

describe('Routing', () => {
    it('renders news feed at /news/1', async () => {
        renderWithRouter('/news/1');
        await waitFor(() => {
            expect(screen.getByText('Routed Story')).toBeInTheDocument();
        });
        expect(api.fetchFeed).toHaveBeenCalledWith('news', 1, expect.anything());
    });

    it('renders newest feed at /newest/1', async () => {
        renderWithRouter('/newest/1');
        await waitFor(() => {
            expect(screen.getByText('Routed Story')).toBeInTheDocument();
        });
        expect(api.fetchFeed).toHaveBeenCalledWith('newest', 1, expect.anything());
    });

    it('renders show feed at /show/1', async () => {
        renderWithRouter('/show/1');
        await waitFor(() => {
            expect(screen.getByText('Routed Story')).toBeInTheDocument();
        });
        expect(api.fetchFeed).toHaveBeenCalledWith('show', 1, expect.anything());
    });

    it('renders header nav links', async () => {
        renderWithRouter('/news/1');
        expect(screen.getByText('new')).toBeInTheDocument();
        expect(screen.getByText('show')).toBeInTheDocument();
        expect(screen.getByText('ask')).toBeInTheDocument();
        expect(screen.getByText('jobs')).toBeInTheDocument();
    });

    it('renders footer', async () => {
        renderWithRouter('/news/1');
        expect(screen.getByText('GitHub')).toBeInTheDocument();
    });
});
