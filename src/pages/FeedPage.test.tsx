import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Story } from '../models';

// Mocked feed hook — controlled per test via `feedResult`.
let feedResult: { stories: Story[]; loading: boolean; error: Error | null };

vi.mock('../hooks', () => ({
    useFeed: () => feedResult,
}));

// Mock settings so the real <Item> children render without a provider.
vi.mock('../context/SettingsContext', () => ({
    useSettings: () => ({
        settings: {
            openLinkInNewTab: false,
            titleFontSize: '16',
            listSpacing: '0',
            theme: 'default',
            showSettings: false,
        },
    }),
}));

import FeedPage from './FeedPage';

function makeStory(id: number): Story {
    return {
        id,
        title: `Story ${id}`,
        points: id,
        user: `user${id}`,
        time: 0,
        time_ago: '1 hour ago' as unknown as number,
        type: 'story',
        url: `https://example.com/${id}`,
        domain: 'example.com',
        comments: [],
        comments_count: id,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
    };
}

function makeStories(count: number): Story[] {
    return Array.from({ length: count }, (_, i) => makeStory(i + 1));
}

function renderFeed(path: string) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route path="/:feed/:page" element={<FeedPage />} />
            </Routes>
        </MemoryRouter>
    );
}

beforeEach(() => {
    feedResult = { stories: [], loading: true, error: null };
    window.scrollTo = vi.fn();
});

describe('FeedPage', () => {
    it('shows the loader while loading', () => {
        feedResult = { stories: [], loading: true, error: null };
        renderFeed('/news/1');
        expect(screen.getByText('Loading...')).toBeTruthy();
    });

    it('shows an error message on failure', () => {
        feedResult = { stories: [], loading: false, error: new Error('boom') };
        renderFeed('/news/1');
        expect(screen.getByText('Could not load news stories.')).toBeTruthy();
    });

    it('renders the story list with start=1 on page 1 and scrolls to top', () => {
        feedResult = { stories: makeStories(3), loading: false, error: null };
        const { container } = renderFeed('/news/1');
        const ol = container.querySelector('ol');
        expect(ol?.getAttribute('start')).toBe('1');
        expect(ol?.classList.contains('list-margin')).toBe(true);
        expect(container.querySelectorAll('li.post').length).toBe(3);
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('computes listStart from the page (page 2 -> 31)', () => {
        feedResult = { stories: makeStories(3), loading: false, error: null };
        const { container } = renderFeed('/news/2');
        expect(container.querySelector('ol')?.getAttribute('start')).toBe('31');
    });

    it('hides Prev on page 1 and shows More with a full page of 30', () => {
        feedResult = { stories: makeStories(30), loading: false, error: null };
        renderFeed('/news/1');
        expect(screen.queryByText('‹ Prev')).toBeNull();
        const more = screen.getByText('More ›') as HTMLAnchorElement;
        expect(more.getAttribute('href')).toBe('/news/2');
    });

    it('shows Prev on page 2 and hides More when fewer than 30', () => {
        feedResult = { stories: makeStories(29), loading: false, error: null };
        renderFeed('/news/2');
        const prev = screen.getByText('‹ Prev') as HTMLAnchorElement;
        expect(prev.getAttribute('href')).toBe('/news/1');
        expect(screen.queryByText('More ›')).toBeNull();
    });

    it('shows the jobs header (with Triplebyte link) only for the jobs feed', () => {
        feedResult = { stories: makeStories(2), loading: false, error: null };
        const { container } = renderFeed('/jobs/1');
        expect(screen.getByText(/These are jobs at startups/)).toBeTruthy();
        expect((screen.getByText('Triplebyte') as HTMLAnchorElement).getAttribute('href')).toBe(
            'https://triplebyte.com/?ref=yc_jobs'
        );
        // The jobs list does not get the list-margin class.
        expect(container.querySelector('ol')?.classList.contains('list-margin')).toBe(false);
    });

    it('omits the jobs header for non-job feeds', () => {
        feedResult = { stories: makeStories(2), loading: false, error: null };
        renderFeed('/news/1');
        expect(screen.queryByText(/These are jobs at startups/)).toBeNull();
    });
});
