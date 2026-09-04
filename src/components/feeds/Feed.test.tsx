import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SettingsProvider } from '../../context/SettingsContext';
import * as api from '../../services/hackernews-api';
import type { Story } from '../../models/story';
import Feed from './Feed';

afterEach(() => vi.restoreAllMocks());

function story(id: number): Story {
    return {
        id,
        title: `Story ${id}`,
        points: 1,
        user: 'pg',
        time_ago: '1 hour ago',
        type: 'story',
        url: `https://example.com/${id}`,
        domain: 'example.com',
        comments_count: 0,
    } as Story;
}

function renderFeed(path = '/news/2') {
    return render(
        <SettingsProvider>
            <MemoryRouter initialEntries={[path]}>
                <Routes>
                    <Route path="/news/:page" element={<Feed feedType="news" />} />
                </Routes>
            </MemoryRouter>
        </SettingsProvider>
    );
}

describe('Feed', () => {
    it('renders the stories of the requested page with pagination links', async () => {
        vi.spyOn(api, 'fetchFeed').mockResolvedValue(Array.from({ length: 30 }, (_unused, i) => story(i + 1)));

        renderFeed();

        expect(await screen.findByText('Story 1')).toBeInTheDocument();
        expect(api.fetchFeed).toHaveBeenCalledWith('news', 2, expect.anything());
        expect(screen.getByRole('list')).toHaveAttribute('start', '31');
        expect(screen.getByText('‹ Prev')).toHaveAttribute('href', '/news/1');
        expect(screen.getByText('More ›')).toHaveAttribute('href', '/news/3');
    });

    it('shows an error message when the feed cannot be loaded', async () => {
        vi.spyOn(api, 'fetchFeed').mockRejectedValue(new Error('boom'));
        vi.spyOn(console, 'error').mockImplementation(() => {});

        renderFeed('/news/1');

        await waitFor(() => expect(screen.getByText('Could not load news stories.')).toBeInTheDocument());
    });
});
