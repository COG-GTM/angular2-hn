import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { FEEDS, type Feed as FeedName } from '../shared/models';
import { makeStory } from '../test/fixtures';
import { mockFetch, renderApp, renderWithProviders } from '../test/utils';
import { Feed } from './Feed';

const stories = (count: number, startId = 1) =>
    Array.from({ length: count }, (_, i) => makeStory({ id: startId + i, title: `Story ${startId + i}` }));

function renderFeed(feedType: FeedName, page: number) {
    return renderWithProviders(<Feed />, {
        path: `/${feedType}/:page`,
        route: `/${feedType}/${page}`,
        handle: { feedType },
    });
}

describe('Feed', () => {
    it('shows the loader until the feed arrives, then the list', async () => {
        let release!: () => void;
        const gate = new Promise<void>((resolve) => (release = resolve));
        const mocked = mockFetch({ '/news?page=1': stories(3) });
        vi.stubGlobal('fetch', async (...args: Parameters<typeof fetch>) => {
            await gate;
            return mocked(args[0]);
        });

        const { container } = renderFeed('news', 1);
        expect(container.querySelector('.loading-section')).toBeInTheDocument();
        expect(container.querySelector('ol')).not.toBeInTheDocument();

        await act(async () => release());
        expect(await screen.findByText('Story 1')).toBeInTheDocument();
        expect(container.querySelector('.loading-section')).not.toBeInTheDocument();
        expect(container.querySelectorAll('ol > li.post > .item-block')).toHaveLength(3);
    });

    it('numbers the list from the page offset', async () => {
        mockFetch({ '/news?page=3': stories(30, 61) });
        const { container } = renderFeed('news', 3);
        await screen.findByText('Story 61');
        expect(container.querySelector('ol')).toHaveAttribute('start', '61');
        expect(container.querySelector('ol')).toHaveClass('list-margin');
    });

    it('requests the feed for the route and page', async () => {
        const fetchMock = mockFetch({ '/show?page=2': stories(1) });
        renderFeed('show', 2);
        await screen.findByText('Story 1');
        expect(fetchMock).toHaveBeenCalledWith(
            'https://node-hnapi.herokuapp.com/show?page=2',
            expect.objectContaining({ signal: expect.any(AbortSignal) })
        );
    });

    it.each(FEEDS)('shows the %s error message when the request fails', async (feedType) => {
        mockFetch({ [`/${feedType}?page=1`]: { status: 500, body: 'boom' } });
        renderFeed(feedType, 1);
        expect(await screen.findByText(`Could not load ${feedType} stories.`)).toBeInTheDocument();
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('shows the job header (and no list margin) only on jobs', async () => {
        mockFetch({ '/jobs?page=1': stories(2).map((s) => ({ ...s, type: 'job' })) });
        const { container } = renderFeed('jobs', 1);
        await screen.findByText('Story 1');
        expect(container.querySelector('p.job-header')).toHaveTextContent(
            'These are jobs at startups that were funded by Y Combinator.'
        );
        expect(screen.getByRole('link', { name: 'Triplebyte' })).toHaveAttribute(
            'href',
            'https://triplebyte.com/?ref=yc_jobs'
        );
        expect(container.querySelector('ol')).not.toHaveClass('list-margin');
    });

    it.each(['news', 'newest', 'show', 'ask'] as const)('has no job header on %s', async (feedType) => {
        mockFetch({ [`/${feedType}?page=1`]: stories(2) });
        const { container } = renderFeed(feedType, 1);
        await screen.findByText('Story 1');
        expect(container.querySelector('.job-header')).not.toBeInTheDocument();
    });

    it('hides Prev on page 1 and shows More for a full page', async () => {
        mockFetch({ '/news?page=1': stories(30) });
        const { container } = renderFeed('news', 1);
        await screen.findByText('Story 1');
        expect(container.querySelector('.nav a.prev')).not.toBeInTheDocument();
        expect(container.querySelector('.nav a.more')).toHaveAttribute('href', '/news/2');
        expect(container.querySelector('.nav a.more')).toHaveTextContent('More ›');
    });

    it('shows Prev after page 1 and hides More for a short page', async () => {
        mockFetch({ '/ask?page=2': stories(12) });
        const { container } = renderFeed('ask', 2);
        await screen.findByText('Story 1');
        expect(container.querySelector('.nav a.prev')).toHaveAttribute('href', '/ask/1');
        expect(container.querySelector('.nav a.prev')).toHaveTextContent('‹ Prev');
        expect(container.querySelector('.nav a.more')).not.toBeInTheDocument();
    });

    it('scrolls to the top when data arrives and on page change, never showing the old page', async () => {
        let releasePage2!: () => void;
        const page2Gate = new Promise<void>((resolve) => (releasePage2 = resolve));
        const mocked = mockFetch({ '/news?page=1': stories(30, 1), '/news?page=2': stories(30, 31) });
        vi.stubGlobal('fetch', async (...args: Parameters<typeof fetch>) => {
            if (String(args[0]).includes('page=2')) await page2Gate;
            return mocked(args[0]);
        });
        const scrollTo = vi.mocked(window.scrollTo);
        scrollTo.mockClear();

        const { container, router } = renderApp({ route: '/news/1' });
        await screen.findByText('Story 1');
        expect(scrollTo).toHaveBeenCalledWith(0, 0);
        scrollTo.mockClear();

        await userEvent.click(container.querySelector('.nav a.more')!);
        await waitFor(() => expect(router.state.location.pathname).toBe('/news/2'));
        expect(screen.queryByText('Story 1')).not.toBeInTheDocument();
        expect(container.querySelector('.loading-section')).toBeInTheDocument();
        expect(scrollTo).not.toHaveBeenCalled();

        await act(async () => releasePage2());
        expect(await screen.findByText('Story 31')).toBeInTheDocument();
        expect(container.querySelector('ol')).toHaveAttribute('start', '31');
        expect(scrollTo).toHaveBeenCalledWith(0, 0);
    });
});
