import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SettingsProvider } from '../context/SettingsProvider';
import type { Story } from '../types';
import { FeedPage } from './FeedPage';

const stories = [
    { id: 1, title: 'First story', points: 5, user: 'a', time_ago: '1 hour ago', type: 'story', url: 'https://a.dev', domain: 'a.dev', comments_count: 2 },
    { id: 2, title: 'Second story', points: 8, user: 'b', time_ago: '2 hours ago', type: 'story', url: 'https://b.dev', domain: 'b.dev', comments_count: 0 },
] as Story[];

afterEach(() => vi.unstubAllGlobals());

function renderFeed() {
    render(
        <SettingsProvider>
            <MemoryRouter initialEntries={['/news/1']}>
                <Routes>
                    <Route path="/:feedType/:page" element={<FeedPage feedType="news" />} />
                </Routes>
            </MemoryRouter>
        </SettingsProvider>
    );
}

describe('FeedPage', () => {
    it('renders stories returned by the API', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => stories }));
        renderFeed();

        expect(screen.getByText('Loading...')).toBeInTheDocument();
        await waitFor(() => expect(screen.getByRole('link', { name: 'First story' })).toBeInTheDocument());
        expect(screen.getByRole('link', { name: 'Second story' })).toBeInTheDocument();
    });

    it('renders an error message when the request fails', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
        renderFeed();

        await waitFor(() => expect(screen.getByText('Could not load news stories.')).toBeInTheDocument());
    });
});
