import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Feed } from './Feed';
import { SettingsProvider } from '../context/SettingsContext';
import * as api from '../services/hackernews-api';
import type { Story } from '../types';

const sampleStory: Story = {
    id: 1,
    title: 'A sample story',
    points: 100,
    user: 'tester',
    time: 0,
    time_ago: 0,
    type: 'story',
    url: 'https://example.com/article',
    domain: 'example.com',
    comments: [],
    comments_count: 5,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
};

describe('Feed page', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('renders stories returned by the API service', async () => {
        vi.spyOn(api, 'fetchFeed').mockResolvedValue([sampleStory]);

        render(
            <SettingsProvider>
                <MemoryRouter initialEntries={['/news/1']}>
                    <Routes>
                        <Route
                            path="/news/:page"
                            element={<Feed feedType="news" />}
                        />
                    </Routes>
                </MemoryRouter>
            </SettingsProvider>
        );

        await waitFor(() =>
            expect(screen.getByText('A sample story')).toBeInTheDocument()
        );
        expect(api.fetchFeed).toHaveBeenCalledWith(
            'news',
            1,
            expect.anything()
        );
    });
});
