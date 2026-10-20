import { act, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { apiUrls } from '../../shared/api';
import { FEED_TYPES, type FeedType } from '../../shared/models';
import { deferred, jsonResponse, mockFetch, renderWithProviders, textResponse } from '../../shared/test-utils';
import { FeedList } from './FeedList';
import { makeStories, makeStory } from './fixtures';

function renderFeed(feedType: FeedType, page: string | number = 1) {
    return renderWithProviders(<FeedList feedType={feedType} />, {
        route: `/${feedType}/${page}`,
        path: `/${feedType}/:page`,
    });
}

function titles() {
    return screen.queryAllByRole('link').filter((a) => a.classList.contains('title'));
}

describe('FeedList', () => {
    const initialRestoration = window.history.scrollRestoration;
    afterEach(() => {
        window.history.scrollRestoration = initialRestoration;
    });

    it('shows the loader while the feed is loading', async () => {
        const pending = deferred();
        mockFetch({ [apiUrls.feed('news', 1)]: () => pending.promise });
        renderFeed('news');
        expect(screen.getByRole('status')).toHaveTextContent('Loading...');
        expect(screen.getByTestId('feed-list')).toHaveClass('main-content', 'feed');

        await act(async () => pending.resolve(makeStories(3)));
        expect(await screen.findByRole('link', { name: 'Story 1' })).toBeInTheDocument();
        expect(screen.queryByRole('status')).toBeNull();
    });

    it.each(FEED_TYPES)('fetches the %s feed for the :page param', async (feedType) => {
        const fetch = mockFetch({ [apiUrls.feed(feedType, 2)]: makeStories(2) });
        renderFeed(feedType, 2);
        expect(await screen.findByRole('link', { name: 'Story 1' })).toBeInTheDocument();
        expect(fetch.callsTo(apiUrls.feed(feedType, 2))).toHaveLength(1);
        expect(fetch.unmatched).toEqual([]);
    });

    it('shows the Angular error message when the request fails', async () => {
        mockFetch({ [apiUrls.feed('show', 1)]: textResponse('boom', 500) });
        renderFeed('show');
        expect(await screen.findByRole('alert')).toHaveTextContent('Could not load show stories.');
        expect(screen.queryByRole('status')).toBeNull();
        expect(screen.queryByRole('list')).toBeNull();
    });

    it('treats a 200 response with an error body as an error', async () => {
        mockFetch({ [apiUrls.feed('ask', 1)]: jsonResponse({ error: 'Something broke' }) });
        renderFeed('ask');
        expect(await screen.findByRole('alert')).toHaveTextContent('Could not load ask stories.');
    });

    it.each(['abc', '0', '-1', '1.5'])('shows an error (no request, no endless loader) for page "%s"', async (page) => {
        const fetch = mockFetch();
        renderFeed('newest', page);
        expect(await screen.findByRole('alert')).toHaveTextContent('Could not load newest stories.');
        expect(fetch.calls).toHaveLength(0);
    });

    it('renders page 1 numbered from 1 with More but no Prev', async () => {
        mockFetch({ [apiUrls.feed('news', 1)]: makeStories(30) });
        renderFeed('news');
        await screen.findByRole('link', { name: 'Story 30' });
        const list = screen.getByRole('list');
        expect(list.tagName).toBe('OL');
        expect(list).toHaveAttribute('start', '1');
        expect(list).toHaveClass('list-margin');
        expect(within(list).getAllByRole('listitem')).toHaveLength(30);
        expect(within(list).getAllByRole('listitem')[0]).toHaveClass('post');
        expect(titles()).toHaveLength(30);
        expect(screen.queryByRole('link', { name: '‹ Prev' })).toBeNull();
        expect(screen.getByRole('link', { name: 'More ›' })).toHaveAttribute('href', '/news/2');
        expect(screen.getByRole('link', { name: 'More ›' })).toHaveClass('more');
        expect(screen.queryByText(/jobs at startups/)).toBeNull();
    });

    it('renders later pages numbered from (page - 1) * 30 + 1 with Prev, and hides More below 30 items', async () => {
        mockFetch({ [apiUrls.feed('show', 3)]: makeStories(12, 61) });
        renderFeed('show', 3);
        await screen.findByRole('link', { name: 'Story 61' });
        expect(screen.getByRole('list')).toHaveAttribute('start', '61');
        expect(screen.getByRole('link', { name: '‹ Prev' })).toHaveAttribute('href', '/show/2');
        expect(screen.getByRole('link', { name: '‹ Prev' })).toHaveClass('prev');
        expect(screen.queryByRole('link', { name: 'More ›' })).toBeNull();
    });

    it('renders an empty page without crashing (Prev only)', async () => {
        mockFetch({ [apiUrls.feed('news', 2)]: [] });
        renderFeed('news', 2);
        expect(await screen.findByRole('link', { name: '‹ Prev' })).toBeInTheDocument();
        expect(screen.queryAllByRole('listitem')).toHaveLength(0);
        expect(screen.queryByRole('link', { name: 'More ›' })).toBeNull();
    });

    it('shows the jobs header with the Triplebyte link and no list-margin', async () => {
        const jobs = [makeStory({ id: 1, type: 'job', title: 'Acme is hiring' })];
        mockFetch({ [apiUrls.feed('jobs', 1)]: jobs });
        renderFeed('jobs');
        await screen.findByRole('link', { name: 'Acme is hiring' });
        const header = document.querySelector('.job-header');
        expect(header).toHaveTextContent(
            'These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC startup through Triplebyte.'
        );
        expect(screen.getByRole('link', { name: 'Triplebyte' })).toHaveAttribute(
            'href',
            'https://triplebyte.com/?ref=yc_jobs'
        );
        expect(screen.getByRole('list')).not.toHaveClass('list-margin');
    });

    it('navigates with More/Prev, shows the loader instead of the previous page and scrolls to top', async () => {
        const page2 = deferred();
        const page1Again = deferred();
        let page1Calls = 0;
        mockFetch({
            [apiUrls.feed('news', 1)]: () => (++page1Calls === 1 ? makeStories(30) : page1Again.promise),
            [apiUrls.feed('news', 2)]: () => page2.promise,
        });
        const { user } = renderWithProviders(<FeedList feedType="news" />, {
            route: '/news/1',
            path: '/news/:page',
        });
        await screen.findByRole('link', { name: 'Story 1' });
        const scrollCalls = (window.scrollTo as unknown as { mock: { calls: unknown[] } }).mock.calls.length;

        await user.click(screen.getByRole('link', { name: 'More ›' }));
        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Story 1' })).toBeNull();
        expect(window.scrollTo).toHaveBeenLastCalledWith(0, 0);
        expect((window.scrollTo as unknown as { mock: { calls: unknown[] } }).mock.calls.length).toBeGreaterThan(
            scrollCalls
        );

        await act(async () => page2.resolve(makeStories(30, 31)));
        expect(await screen.findByRole('link', { name: 'Story 31' })).toBeInTheDocument();
        expect(screen.getByRole('list')).toHaveAttribute('start', '31');

        await user.click(screen.getByRole('link', { name: '‹ Prev' }));
        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Story 31' })).toBeNull();
        await act(async () => page1Again.resolve(makeStories(30)));
        expect(await screen.findByRole('link', { name: 'Story 1' })).toBeInTheDocument();
        expect(page1Calls).toBe(2);
    });

    it('scrolls to top on mount', () => {
        mockFetch({ [apiUrls.feed('news', 1)]: () => deferred().promise });
        renderFeed('news');
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it("sets history.scrollRestoration to 'manual' while mounted and restores it on unmount", () => {
        window.history.scrollRestoration = 'auto';
        mockFetch({ [apiUrls.feed('news', 1)]: () => deferred().promise });
        const { unmount } = renderFeed('news');
        expect(window.history.scrollRestoration).toBe('manual');
        unmount();
        expect(window.history.scrollRestoration).toBe('auto');
    });

    it('applies the titleFontSize and listSpacing settings to every feed item', async () => {
        localStorage.setItem('titleFontSize', '24');
        localStorage.setItem('listSpacing', '8');
        mockFetch({ [apiUrls.feed('news', 1)]: makeStories(2) });
        renderFeed('news');
        await screen.findByRole('link', { name: 'Story 2' });
        for (const title of titles()) expect(title).toHaveStyle({ fontSize: '24px' });
        for (const item of screen.getAllByTestId('feed-item')) {
            expect(item.firstElementChild).toHaveStyle({ marginBottom: '8px' });
        }
    });
});
