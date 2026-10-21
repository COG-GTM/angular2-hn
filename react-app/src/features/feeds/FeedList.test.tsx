import { screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { apiUrls } from '../../shared/api';
import { deferred, jsonResponse, mockFetch, renderWithProviders } from '../../shared/test-utils';
import { FeedList } from './FeedList';
import { testStories } from './testStory';

const initialScrollRestoration = window.history.scrollRestoration;

afterEach(() => {
    window.history.scrollRestoration = initialScrollRestoration;
});

function renderFeed(feedType: 'news' | 'newest' | 'show' | 'ask' | 'jobs', page: string | number) {
    return renderWithProviders(<FeedList feedType={feedType} />, {
        route: `/${feedType}/${page}`,
        path: `/${feedType}/:page`,
    });
}

describe('FeedList', () => {
    it('shows the loader while the feed is pending', async () => {
        const request = deferred<Response>();
        mockFetch({ [apiUrls.feed('news', 1)]: () => request.promise });
        const { container } = renderFeed('news', 1);
        expect(screen.getByRole('status')).toHaveTextContent('Loading...');
        expect(container.querySelector('.main-content.feed .loading-section')).not.toBeNull();
        request.resolve(jsonResponse(testStories(3)));
        expect(await screen.findAllByRole('link', { name: 'Story 1' })).toHaveLength(1);
        expect(screen.queryByRole('status')).toBeNull();
    });

    it.each(['news', 'newest', 'show', 'ask', 'jobs'] as const)(
        "shows Angular's error text when the %s feed fails",
        async (feedType) => {
            mockFetch({ [apiUrls.feed(feedType, 2)]: jsonResponse({ message: 'boom' }, 500) });
            renderFeed(feedType, 2);
            expect(await screen.findByRole('alert')).toHaveTextContent(`Could not load ${feedType} stories.`);
        }
    );

    it('treats an invalid page as an error without requesting it', async () => {
        const fetch = mockFetch();
        renderFeed('show', 'abc');
        expect(await screen.findByRole('alert')).toHaveTextContent('Could not load show stories.');
        expect(fetch.calls).toHaveLength(0);
    });

    it('treats a non-list body as an error', async () => {
        mockFetch({ [apiUrls.feed('news', 1)]: { error: 'nope' } });
        renderFeed('news', 1);
        expect(await screen.findByRole('alert')).toHaveTextContent('Could not load news stories.');
    });

    it('renders page 1 as a numbered list with only a More link', async () => {
        mockFetch({ [apiUrls.feed('news', 1)]: testStories(30) });
        const { container } = renderFeed('news', 1);
        await screen.findByRole('link', { name: 'Story 1' });
        const list = container.querySelector('ol')!;
        expect(list).toHaveAttribute('start', '1');
        expect(list).toHaveClass('list-margin');
        expect(list.querySelectorAll('li.post')).toHaveLength(30);
        expect(screen.getByRole('link', { name: 'More ›' })).toHaveAttribute('href', '/news/2');
        expect(screen.queryByRole('link', { name: /Prev/ })).toBeNull();
        expect(container.querySelector('.job-header')).toBeNull();
    });

    it('continues numbering across pages and links back with ‹ Prev', async () => {
        mockFetch({ [apiUrls.feed('newest', 3)]: testStories(30, 61) });
        const { container } = renderFeed('newest', 3);
        await screen.findByRole('link', { name: 'Story 61' });
        expect(container.querySelector('ol')).toHaveAttribute('start', '61');
        expect(screen.getByRole('link', { name: '‹ Prev' })).toHaveAttribute('href', '/newest/2');
        expect(screen.getByRole('link', { name: 'More ›' })).toHaveAttribute('href', '/newest/4');
        expect(container.querySelector('.nav')?.textContent).toBe('‹ Prev More ›');
    });

    it('hides More when the page has fewer than 30 stories', async () => {
        mockFetch({ [apiUrls.feed('ask', 2)]: testStories(12, 31) });
        renderFeed('ask', 2);
        await screen.findByRole('link', { name: 'Story 31' });
        expect(screen.queryByRole('link', { name: /More/ })).toBeNull();
        expect(screen.getByRole('link', { name: '‹ Prev' })).toHaveAttribute('href', '/ask/1');
    });

    it('renders the jobs header and drops list-margin on the jobs feed', async () => {
        const jobs = testStories(3).map((job) => ({ ...job, type: 'job' }));
        mockFetch({ [apiUrls.feed('jobs', 1)]: jobs });
        const { container } = renderFeed('jobs', 1);
        await screen.findByRole('link', { name: 'Story 1' });
        const header = container.querySelector('p.job-header')!;
        expect(header.textContent).toBe(
            'These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC startup through Triplebyte.'
        );
        expect(screen.getByRole('link', { name: 'Triplebyte' })).toHaveAttribute(
            'href',
            'https://triplebyte.com/?ref=yc_jobs'
        );
        expect(container.querySelector('ol')).not.toHaveClass('list-margin');
        expect(container.querySelector('.comment-number')).toBeNull();
    });

    it('fetches the next page with the loader when More is clicked', async () => {
        const page2 = deferred<Response>();
        mockFetch({
            [apiUrls.feed('news', 1)]: testStories(30),
            [apiUrls.feed('news', 2)]: () => page2.promise,
        });
        const { user, container } = renderFeed('news', 1);
        await user.click(await screen.findByRole('link', { name: 'More ›' }));
        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Story 1' })).toBeNull();
        page2.resolve(jsonResponse(testStories(30, 31)));
        await screen.findByRole('link', { name: 'Story 31' });
        expect(container.querySelector('ol')).toHaveAttribute('start', '31');
    });

    it('supports keyboard pagination (Tab to More, Enter)', async () => {
        mockFetch({
            [apiUrls.feed('show', 1)]: testStories(30),
            [apiUrls.feed('show', 2)]: testStories(5, 31),
        });
        const { user } = renderFeed('show', 1);
        const more = await screen.findByRole('link', { name: 'More ›' });
        more.focus();
        await user.keyboard('{Enter}');
        await screen.findByRole('link', { name: 'Story 31' });
        expect(screen.queryByRole('link', { name: /More/ })).toBeNull();
    });

    it('scrolls to the top on mount and on every page change', async () => {
        mockFetch({
            [apiUrls.feed('news', 1)]: testStories(30),
            [apiUrls.feed('news', 2)]: testStories(30, 31),
        });
        const { user } = renderFeed('news', 1);
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
        const callsAfterMount = (window.scrollTo as unknown as { mock: { calls: unknown[] } }).mock.calls.length;
        await user.click(await screen.findByRole('link', { name: 'More ›' }));
        await waitFor(() =>
            expect((window.scrollTo as unknown as { mock: { calls: unknown[] } }).mock.calls.length).toBeGreaterThan(
                callsAfterMount
            )
        );
    });

    it('sets history.scrollRestoration to manual while mounted and restores it on unmount', async () => {
        window.history.scrollRestoration = 'auto';
        mockFetch({ [apiUrls.feed('news', 1)]: testStories(2) });
        const { unmount } = renderFeed('news', 1);
        expect(window.history.scrollRestoration).toBe('manual');
        await screen.findByRole('link', { name: 'Story 1' });
        unmount();
        expect(window.history.scrollRestoration).toBe('auto');
    });
});
