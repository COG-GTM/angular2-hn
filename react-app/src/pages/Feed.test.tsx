import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SettingsProvider } from '../context/SettingsContext';
import type { Story } from '../models/story';
import Feed from './Feed';

function makeStory(id: number): Story {
    return {
        id,
        title: `Story ${id}`,
        points: 1,
        user: 'pg',
        time: 0,
        time_ago: 0,
        type: 'story',
        url: 'https://example.com',
        comments_count: 0,
    };
}

function renderFeed(feedType: string, path: string) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <SettingsProvider>
                <Routes>
                    <Route path="/:feedType/:page" element={<Feed feedType={feedType} />} />
                </Routes>
            </SettingsProvider>
        </MemoryRouter>
    );
}

function mockFeed(items: Story[]) {
    vi.stubGlobal(
        'fetch',
        vi.fn(() => Promise.resolve(new Response(JSON.stringify(items))))
    );
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('Feed', () => {
    it('renders the fetched stories and a More link on a full page', async () => {
        mockFeed(Array.from({ length: 30 }, (_, index) => makeStory(index + 1)));

        renderFeed('news', '/news/2');

        await waitFor(() => expect(screen.getByText('Story 1')).toBeInTheDocument());
        expect(screen.getByRole('list')).toHaveAttribute('start', '31');
        expect(screen.getByRole('link', { name: '‹ Prev' })).toHaveAttribute('href', '/news/1');
        expect(screen.getByRole('link', { name: 'More ›' })).toHaveAttribute('href', '/news/3');
    });

    it('shows an error message when the request fails', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(() => Promise.reject(new Error('offline')))
        );

        renderFeed('news', '/news/1');

        await waitFor(() =>
            expect(screen.getByText('Could not load news stories.')).toBeInTheDocument()
        );
    });

    it('shows the jobs header on the jobs feed', async () => {
        mockFeed([makeStory(1)]);

        renderFeed('jobs', '/jobs/1');

        await waitFor(() => expect(screen.getByText(/Y Combinator/)).toBeInTheDocument());
        expect(screen.queryByRole('link', { name: '‹ Prev' })).not.toBeInTheDocument();
    });
});
