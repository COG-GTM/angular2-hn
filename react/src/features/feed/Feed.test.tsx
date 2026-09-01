import { act, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Link, Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

import { Feed } from './Feed';
import { FeedRoute, Story } from '../../shared/models';
import { hackerNewsApi } from '../../shared/services/hackernews-api';
import { SettingsProvider } from '../../shared/settings/SettingsContext';

function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 1,
        title: 'A story',
        points: 10,
        user: 'alice',
        time: 0,
        time_ago: '1 hour ago' as unknown as number,
        type: 'story',
        url: 'https://example.com/story',
        domain: 'example.com',
        comments: [],
        comments_count: 5,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
        ...overrides,
    };
}

function renderFeed(feedType: FeedRoute, path = `/${feedType}`) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <SettingsProvider>
                <Link to="/news/2">next</Link>
                <Routes>
                    <Route path="/:feed" element={<Feed feedType={feedType} />} />
                    <Route path="/:feed/:page" element={<Feed feedType={feedType} />} />
                </Routes>
            </SettingsProvider>
        </MemoryRouter>
    );
}

describe('Feed', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('shows a loader while the feed is loading', () => {
        vi.spyOn(hackerNewsApi, 'fetchFeed').mockReturnValue(new Promise(() => {}));

        renderFeed('news');

        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(screen.getByText('Loading...')).toHaveClass('loader');
    });

    it('renders stories with the correct rank start', async () => {
        const fetchFeed = vi
            .spyOn(hackerNewsApi, 'fetchFeed')
            .mockResolvedValue([
                makeStory({ id: 1, title: 'First story' }),
                makeStory({ id: 2, title: 'Second story' }),
            ]);

        const firstRender = renderFeed('news');
        expect(await screen.findByText('First story')).toBeInTheDocument();
        expect(firstRender.container.querySelector('ol')).toHaveAttribute('start', '1');
        firstRender.unmount();

        fetchFeed.mockResolvedValue([makeStory({ id: 31, title: 'Page two story' })]);
        renderFeed('news', '/news/2');
        expect(await screen.findByText('Page two story')).toBeInTheDocument();
        expect(document.querySelector('ol')).toHaveAttribute('start', '31');
    });

    it('shows the feed error message when loading fails', async () => {
        vi.spyOn(hackerNewsApi, 'fetchFeed').mockRejectedValue(new Error('network error'));

        renderFeed('news');

        expect(await screen.findByText('Could not load news stories.')).toBeInTheDocument();
    });

    it('shows the jobs header only for the jobs feed', async () => {
        vi.spyOn(hackerNewsApi, 'fetchFeed').mockResolvedValue([makeStory({ type: 'job' })]);

        const { unmount } = renderFeed('jobs');
        expect(await screen.findByText(/These are jobs at startups/)).toBeInTheDocument();
        unmount();

        renderFeed('news');
        await screen.findByText('A story');
        expect(screen.queryByText(/These are jobs at startups/)).not.toBeInTheDocument();
    });

    it('adds list-margin to non-job feeds only', async () => {
        vi.spyOn(hackerNewsApi, 'fetchFeed').mockResolvedValue([makeStory()]);

        const { unmount } = renderFeed('news');
        await screen.findByText('A story');
        expect(document.querySelector('ol')).toHaveClass('list-margin');
        unmount();

        renderFeed('jobs');
        await screen.findByText('A story');
        expect(document.querySelector('ol')).not.toHaveClass('list-margin');
    });

    it('renders pagination links for the current page and item count', async () => {
        const fetchFeed = vi.spyOn(hackerNewsApi, 'fetchFeed');
        fetchFeed
            .mockResolvedValueOnce(Array.from({ length: 30 }, (_, index) => makeStory({ id: index + 1 })))
            .mockResolvedValueOnce(Array.from({ length: 30 }, (_, index) => makeStory({ id: index + 1 })))
            .mockResolvedValueOnce(
                Array.from({ length: 29 }, (_, index) =>
                    makeStory({ id: index + 1, title: index === 0 ? 'Short page story' : `Story ${index + 1}` })
                )
            );

        const firstRender = renderFeed('news');
        await screen.findByRole('link', { name: 'More ›' });
        expect(screen.queryByRole('link', { name: '‹ Prev' })).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'More ›' })).toHaveAttribute('href', '/news/2');
        firstRender.unmount();

        const secondRender = renderFeed('news', '/news/2');
        await screen.findByRole('link', { name: '‹ Prev' });
        expect(screen.getByRole('link', { name: '‹ Prev' })).toHaveAttribute('href', '/news/1');
        secondRender.unmount();

        renderFeed('news');
        await screen.findByText('Short page story');
        expect(screen.queryByRole('link', { name: 'More ›' })).not.toBeInTheDocument();
    });

    it('scrolls to the top after loading', async () => {
        const scrollTo = vi.mocked(window.scrollTo);
        vi.spyOn(hackerNewsApi, 'fetchFeed').mockResolvedValue([makeStory()]);

        renderFeed('news');
        await screen.findByText('A story');

        expect(scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('refetches when navigating to another page', async () => {
        const fetchFeed = vi.spyOn(hackerNewsApi, 'fetchFeed').mockResolvedValue([makeStory()]);

        renderFeed('news');
        await screen.findByText('A story');

        const user = userEvent.setup();
        await user.click(screen.getByRole('link', { name: 'next' }));

        await waitFor(() => expect(fetchFeed).toHaveBeenCalledWith('news', 2));
        expect(await screen.findByText('A story')).toBeInTheDocument();
        expect(document.querySelector('ol')).toHaveAttribute('start', '31');
    });

    it('ignores stale responses after navigating to another page', async () => {
        let resolveFirst!: (stories: Story[]) => void;
        let resolveSecond!: (stories: Story[]) => void;
        const first = new Promise<Story[]>((resolve) => {
            resolveFirst = resolve;
        });
        const second = new Promise<Story[]>((resolve) => {
            resolveSecond = resolve;
        });
        const fetchFeed = vi.spyOn(hackerNewsApi, 'fetchFeed').mockReturnValueOnce(first).mockReturnValueOnce(second);

        renderFeed('news');
        const user = userEvent.setup();
        await user.click(screen.getByRole('link', { name: 'next' }));
        await waitFor(() => expect(fetchFeed).toHaveBeenCalledWith('news', 2));

        await act(async () => {
            resolveSecond([makeStory({ id: 2, title: 'Page two story' })]);
        });
        expect(await screen.findByText('Page two story')).toBeInTheDocument();

        await act(async () => {
            resolveFirst([makeStory({ id: 1, title: 'Stale page one story' })]);
        });
        await waitFor(() => expect(screen.queryByText('Stale page one story')).not.toBeInTheDocument());
        expect(screen.getByText('Page two story')).toBeInTheDocument();
    });

    it('renders each story inside the expected list wrapper', async () => {
        vi.spyOn(hackerNewsApi, 'fetchFeed').mockResolvedValue([makeStory()]);

        const { container } = renderFeed('news');
        await screen.findByText('A story');

        expect(container.querySelector('li.post > .item-block')).toBeInTheDocument();
    });
});
