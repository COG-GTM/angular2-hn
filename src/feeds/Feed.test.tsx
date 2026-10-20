import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import * as api from '../shared/api/hackernews-api';
import { FEED_PAGE_SIZE, type FeedType, type Story } from '../shared/models';
import { loadInitialSettings, useSettingsStore } from '../shared/store/settings';
import { Feed } from './Feed';

vi.mock('../shared/api/hackernews-api', async (importOriginal) => {
    const original = await importOriginal<typeof api>();
    return { ...original, fetchFeed: vi.fn() };
});

const fetchFeed = vi.mocked(api.fetchFeed);

function makeStories(count: number, type: Story['type'] = 'link'): Story[] {
    return Array.from({ length: count }, (_, index) => ({
        id: 1000 + index,
        title: `Story ${index + 1}`,
        points: type === 'job' ? null : 10 + index,
        user: type === 'job' ? null : `user${index}`,
        time: 1,
        time_ago: '1 hour ago',
        type,
        url: `https://example.com/${index}`,
        domain: 'example.com',
        comments: [],
        comments_count: index,
    }));
}

function renderFeed(feedType: FeedType, path: string) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[path]}>
                <Routes>
                    <Route path={`/${feedType}/:page`} element={<Feed feedType={feedType} />} />
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>
    );
}

describe('Feed', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.stubGlobal(
            'matchMedia',
            vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
        );
        vi.stubGlobal('scrollTo', vi.fn());
        useSettingsStore.setState(loadInitialSettings());
        fetchFeed.mockReset();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('shows the loader while fetching, then the list, and scrolls to top', async () => {
        let resolve!: (stories: Story[]) => void;
        fetchFeed.mockReturnValue(new Promise<Story[]>((r) => (resolve = r)));
        const { container } = renderFeed('news', '/news/1');

        expect(container.querySelector('.app-loader-component')).toBeInTheDocument();
        expect(fetchFeed).toHaveBeenCalledWith('news', 1, expect.anything());
        expect(window.scrollTo).not.toHaveBeenCalled();

        resolve(makeStories(FEED_PAGE_SIZE));

        expect(await screen.findByText('Story 1')).toBeInTheDocument();
        expect(container.querySelector('.app-loader-component')).not.toBeInTheDocument();
        expect(container.querySelectorAll('ol > li.post')).toHaveLength(FEED_PAGE_SIZE);
        expect(container.querySelectorAll('li.post > .app-item.item-block')).toHaveLength(FEED_PAGE_SIZE);
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('starts numbering at 1 on page 1 with only the More link', async () => {
        fetchFeed.mockResolvedValue(makeStories(FEED_PAGE_SIZE));
        const { container } = renderFeed('news', '/news/1');

        await screen.findByText('Story 1');
        const list = container.querySelector('ol');
        expect(list).toHaveAttribute('start', '1');
        expect(list).toHaveClass('list-margin');
        expect(screen.queryByRole('link', { name: /Prev/ })).not.toBeInTheDocument();
        const more = screen.getByRole('link', { name: /More/ });
        expect(more).toHaveAttribute('href', '/news/2');
        expect(more).toHaveClass('more');
    });

    it('continues numbering across pages and links Prev / More', async () => {
        fetchFeed.mockResolvedValue(makeStories(FEED_PAGE_SIZE));
        const { container } = renderFeed('show', '/show/3');

        await screen.findByText('Story 1');
        expect(fetchFeed).toHaveBeenCalledWith('show', 3, expect.anything());
        expect(container.querySelector('ol')).toHaveAttribute('start', String(2 * FEED_PAGE_SIZE + 1));
        const prev = screen.getByRole('link', { name: /Prev/ });
        expect(prev).toHaveAttribute('href', '/show/2');
        expect(prev).toHaveClass('prev');
        expect(screen.getByRole('link', { name: /More/ })).toHaveAttribute('href', '/show/4');
    });

    it('hides the More link on a short (last) page', async () => {
        fetchFeed.mockResolvedValue(makeStories(12));
        renderFeed('ask', '/ask/5');

        await screen.findByText('Story 12');
        expect(screen.getByRole('link', { name: /Prev/ })).toHaveAttribute('href', '/ask/4');
        expect(screen.queryByRole('link', { name: /More/ })).not.toBeInTheDocument();
    });

    it('renders the jobs header and omits the list margin for jobs', async () => {
        fetchFeed.mockResolvedValue(makeStories(FEED_PAGE_SIZE, 'job'));
        const { container } = renderFeed('jobs', '/jobs/1');

        await screen.findByText('Story 1');
        const header = screen.getByText(/These are jobs at startups that were funded by Y Combinator/);
        expect(header).toHaveClass('job-header');
        expect(screen.getByRole('link', { name: 'Triplebyte' })).toHaveAttribute(
            'href',
            'https://triplebyte.com/?ref=yc_jobs'
        );
        expect(container.querySelector('ol')).not.toHaveClass('list-margin');
        expect(screen.queryByText(/points by/)).not.toBeInTheDocument();
    });

    it('does not render the jobs header for other feeds', async () => {
        fetchFeed.mockResolvedValue(makeStories(3));
        renderFeed('newest', '/newest/1');

        await screen.findByText('Story 1');
        expect(screen.queryByText(/These are jobs at startups/)).not.toBeInTheDocument();
    });

    it.each(['0', '-2', '1.5', 'nope'])('redirects invalid page "%s" to page 1 without fetching', async (page) => {
        fetchFeed.mockResolvedValue(makeStories(3));
        const { container } = renderFeed('news', `/news/${page}`);

        await screen.findByText('Story 1');
        expect(fetchFeed).toHaveBeenCalledTimes(1);
        expect(fetchFeed).toHaveBeenCalledWith('news', 1, expect.anything());
        expect(container.querySelector('ol')).toHaveAttribute('start', '1');
    });

    it('shows the error message when the request fails', async () => {
        fetchFeed.mockRejectedValue(new api.HttpError(500, 'https://node-hnapi.herokuapp.com/news?page=1'));
        const { container } = renderFeed('news', '/news/1');

        expect(await screen.findByText('Could not load news stories.')).toBeInTheDocument();
        expect(container.querySelector('.app-error-message')).toBeInTheDocument();
        expect(container.querySelector('.app-loader-component')).not.toBeInTheDocument();
        expect(container.querySelector('ol')).not.toBeInTheDocument();
        await waitFor(() => expect(window.scrollTo).not.toHaveBeenCalled());
    });
});
