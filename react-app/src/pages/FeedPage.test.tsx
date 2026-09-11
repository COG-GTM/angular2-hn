import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsProvider } from '../context/SettingsContext';
import * as api from '../services/hackerNewsApi';
import type { Story } from '../types';
import { FeedPage } from './FeedPage';

vi.mock('../services/hackerNewsApi');
const makeStory = (id: number): Story => ({
    id,
    title: `Title ${id}`,
    points: 1,
    user: 'u',
    time: 0,
    time_ago: 'now',
    type: 'story',
    url: '',
    comments: [],
    comments_count: 0,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
});
const renderPage = () =>
    render(
        <MemoryRouter initialEntries={['/news/1']}>
            <SettingsProvider>
                <FeedPage feedType="news" />
            </SettingsProvider>
        </MemoryRouter>
    );

describe('FeedPage', () => {
    beforeEach(() => vi.resetAllMocks());
    it('renders pagination', async () => {
        vi.mocked(api.fetchFeed).mockResolvedValue(Array.from({ length: 30 }, (_, i) => makeStory(i + 1)));
        renderPage();
        await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(30));
        expect(screen.getByText('More ›')).toHaveAttribute('href', '/news/2');
        expect(screen.queryByText('‹ Prev')).not.toBeInTheDocument();
    });
    it('renders a fetch error', async () => {
        vi.mocked(api.fetchFeed).mockRejectedValue(new Error('offline'));
        renderPage();
        expect(await screen.findByText('Could not load news stories.')).toBeInTheDocument();
    });
});
