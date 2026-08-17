import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Feed } from './Feed';
import { SettingsProvider } from '../context/SettingsProvider';
import * as api from '../services/hackernewsApi';
import type { Story } from '../models';

function story(id: number): Story {
    return {
        id,
        title: `Story ${id}`,
        points: id,
        user: 'pg',
        time: 0,
        time_ago: '1 hour ago',
        type: 'story',
        url: `https://example.com/${id}`,
        domain: 'example.com',
        comments: [],
        comments_count: id,
    };
}

function renderFeed(feedType: string, path: string) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <SettingsProvider>
                <Routes>
                    <Route path={`/${feedType}/:page`} element={<Feed feedType={feedType} />} />
                </Routes>
            </SettingsProvider>
        </MemoryRouter>
    );
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe('Feed', () => {
    it('shows the loader then the stories', async () => {
        vi.spyOn(api, 'fetchFeed').mockResolvedValue([story(1), story(2)]);
        const { container } = renderFeed('news', '/news/1');

        expect(container.querySelector('.loader')).toBeInTheDocument();
        expect(await screen.findByText('Story 1')).toBeInTheDocument();
        expect(container.querySelector('ol')).toHaveAttribute('start', '1');
        expect(container.querySelector('ol')).toHaveClass('list-margin');
    });

    it('shows an error message when the request fails', async () => {
        vi.spyOn(api, 'fetchFeed').mockRejectedValue(new Error('boom'));
        renderFeed('news', '/news/1');
        expect(await screen.findByText('Could not load news stories.')).toBeInTheDocument();
    });

    it('computes listStart and renders prev/more navigation', async () => {
        vi.spyOn(api, 'fetchFeed').mockResolvedValue(Array.from({ length: 30 }, (_, i) => story(i + 1)));
        const { container } = renderFeed('news', '/news/2');

        await screen.findByText('Story 1');
        expect(container.querySelector('ol')).toHaveAttribute('start', '31');
        expect(screen.getByRole('link', { name: '‹ Prev' })).toHaveAttribute('href', '/news/1');
        expect(screen.getByRole('link', { name: 'More ›' })).toHaveAttribute('href', '/news/3');
    });

    it('hides navigation links on the first page with fewer than 30 items', async () => {
        vi.spyOn(api, 'fetchFeed').mockResolvedValue([story(1)]);
        renderFeed('news', '/news/1');
        await screen.findByText('Story 1');
        expect(screen.queryByRole('link', { name: '‹ Prev' })).toBeNull();
        expect(screen.queryByRole('link', { name: 'More ›' })).toBeNull();
    });

    it('renders the job header without list-margin for the jobs feed', async () => {
        vi.spyOn(api, 'fetchFeed').mockResolvedValue([{ ...story(1), type: 'job' }]);
        const { container } = renderFeed('jobs', '/jobs/1');

        await screen.findByText('Story 1');
        expect(container.querySelector('.job-header')).toBeInTheDocument();
        expect(container.querySelector('ol')).not.toHaveClass('list-margin');
    });

    it('aborts the in-flight request on unmount', async () => {
        const spy = vi.spyOn(api, 'fetchFeed').mockResolvedValue([story(1)]);
        const { unmount } = renderFeed('news', '/news/1');
        await waitFor(() => expect(spy).toHaveBeenCalled());
        const signal = spy.mock.calls[0][2] as AbortSignal;
        unmount();
        expect(signal.aborted).toBe(true);
    });
});
