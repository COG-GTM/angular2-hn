import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SettingsProvider } from '../context/SettingsProvider';
import type { Story } from '../types';
import { FeedPage } from './FeedPage';

const stories = [
    {
        id: 1,
        title: 'First story',
        points: 10,
        user: 'ada',
        time_ago: '1 hour ago',
        type: 'story',
        url: 'https://example.com/1',
        domain: 'example.com',
        comments_count: 3,
    },
] as unknown as Story[];

afterEach(() => {
    vi.restoreAllMocks();
});

function renderFeed() {
    return render(
        <MemoryRouter initialEntries={['/news/1']}>
            <SettingsProvider>
                <Routes>
                    <Route path="/news/:page" element={<FeedPage feedType="news" />} />
                </Routes>
            </SettingsProvider>
        </MemoryRouter>
    );
}

describe('FeedPage', () => {
    it('shows the loader and then the fetched stories', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve(stories) })
        );

        renderFeed();

        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(await screen.findByText('First story')).toBeInTheDocument();
    });

    it('shows an error message when the request fails', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
        vi.spyOn(console, 'error').mockImplementation(() => {});

        renderFeed();

        expect(await screen.findByText('Could not load news stories.')).toBeInTheDocument();
    });
});
