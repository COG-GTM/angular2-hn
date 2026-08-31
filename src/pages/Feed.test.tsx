import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SettingsProvider } from '../contexts/SettingsContext';
import Feed from './Feed';

vi.mock('../services/api', () => ({ fetchFeed: vi.fn() }));
import { fetchFeed } from '../services/api';

const makeItem = (id: number) => ({ id, title: `Story ${id}`, points: 1, user: 'user', time: 1, time_ago: '1h', type: 'story', url: '', domain: '', comments: [], comments_count: 0, poll: [], poll_votes_count: 0, deleted: false, dead: false });

describe('Feed', () => {
    beforeEach(() => vi.mocked(fetchFeed).mockResolvedValue(Array.from({ length: 30 }, (_, index) => makeItem(index + 1)) as never));
    it('renders stories and pagination controls', async () => {
        render(<SettingsProvider><MemoryRouter initialEntries={['/news/2']}><Routes><Route path="/news/:page" element={<Feed feedType="news" />} /></Routes></MemoryRouter></SettingsProvider>);
        await waitFor(() => expect(screen.getByText('Story 1')).toBeInTheDocument());
        expect(screen.getByText('‹ Prev')).toBeInTheDocument();
        expect(screen.getByText('More ›')).toBeInTheDocument();
    });
});
