import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Feed } from './Feed';
import { SettingsProvider } from '../../context/SettingsContext';
import { makeStory } from '../../test/fixtures';
import { fetchFeed } from '../../api/hackernews';

vi.mock('../../api/hackernews', () => ({
    fetchFeed: vi.fn(),
}));

const mockedFetchFeed = vi.mocked(fetchFeed);

function renderFeed(route: string) {
    return render(
        <SettingsProvider>
            <MemoryRouter initialEntries={[route]}>
                <Routes>
                    <Route path=":feedType/:page" element={<Feed />} />
                </Routes>
            </MemoryRouter>
        </SettingsProvider>
    );
}

function makeStories(count: number) {
    return Array.from({ length: count }, (_, i) => makeStory({ id: i + 1, title: `Story ${i + 1}` }));
}

describe('Feed', () => {
    beforeEach(() => {
        mockedFetchFeed.mockReset();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('shows the loader while the feed request is pending', () => {
        mockedFetchFeed.mockReturnValue(new Promise(() => {}));
        renderFeed('/news/1');
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders the list of stories returned by the API', async () => {
        mockedFetchFeed.mockResolvedValue(makeStories(3));
        renderFeed('/news/1');
        expect(await screen.findByText('Story 1')).toBeInTheDocument();
        expect(screen.getByText('Story 2')).toBeInTheDocument();
        expect(screen.getByText('Story 3')).toBeInTheDocument();
        expect(mockedFetchFeed).toHaveBeenCalledWith('news', 1);
    });

    it('numbers the list starting at ((page-1)*30)+1', async () => {
        mockedFetchFeed.mockResolvedValue(makeStories(30));
        const { container } = renderFeed('/news/2');
        await screen.findByText('Story 1');
        const ol = container.querySelector('ol');
        expect(ol).toHaveAttribute('start', '31');
        expect(mockedFetchFeed).toHaveBeenCalledWith('news', 2);
    });

    it('renders Prev and More links with correct targets', async () => {
        mockedFetchFeed.mockResolvedValue(makeStories(30));
        renderFeed('/news/2');
        await screen.findByText('Story 1');
        expect(screen.getByRole('link', { name: /Prev/ })).toHaveAttribute('href', '/news/1');
        expect(screen.getByRole('link', { name: /More/ })).toHaveAttribute('href', '/news/3');
    });

    it('hides Prev on the first page and More when fewer than 30 items', async () => {
        mockedFetchFeed.mockResolvedValue(makeStories(10));
        renderFeed('/news/1');
        await screen.findByText('Story 1');
        expect(screen.queryByRole('link', { name: /Prev/ })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /More/ })).not.toBeInTheDocument();
    });

    it('renders the per-feed error message on API failure', async () => {
        mockedFetchFeed.mockRejectedValue(new Error('boom'));
        renderFeed('/show/1');
        await waitFor(() => expect(screen.getByText('Could not load show stories.')).toBeInTheDocument());
    });

    it('shows the job header for the jobs feed', async () => {
        mockedFetchFeed.mockResolvedValue(makeStories(2).map((s) => ({ ...s, type: 'job' as const })));
        renderFeed('/jobs/1');
        await screen.findByText(/These are jobs at startups/);
        expect(screen.getByRole('link', { name: 'Triplebyte' })).toBeInTheDocument();
    });
});
