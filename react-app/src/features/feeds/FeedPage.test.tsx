import { act, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { apiUrls } from '../../api';
import { deferred, jsonResponse, mockFetch, renderWithProviders, textResponse } from '../../test';
import type { FeedType } from '../../types';
import { FeedPage } from './FeedPage';
import { testStories } from './testStory';

function renderFeed(feedType: FeedType, page: string | number) {
    return renderWithProviders(<FeedPage key={feedType} feedType={feedType} />, {
        route: `/${feedType}/${page}`,
        path: `/${feedType}/:page`,
    });
}

const items = (container: HTMLElement) => container.querySelectorAll('ol > li.post');

describe('FeedPage', () => {
    it('shows the loader while the feed is pending, then the stories', async () => {
        const pending = deferred<Response>();
        mockFetch({ [apiUrls.feed('news', 1)]: () => pending.promise });
        const { container } = renderFeed('news', 1);

        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(container.querySelector('ol')).toBeNull();

        await act(async () => pending.resolve(jsonResponse(testStories(30))));
        expect(await screen.findByText('Story 1')).toBeInTheDocument();
        expect(screen.queryByRole('status')).toBeNull();
        expect(items(container)).toHaveLength(30);
    });

    it('requests the feed and page from the route', async () => {
        const api = mockFetch({ [apiUrls.feed('show', 4)]: testStories(30, 91) });
        renderFeed('show', 4);
        expect(await screen.findByText('Story 91')).toBeInTheDocument();
        expect(api.calls.map((call) => call.url)).toEqual([apiUrls.feed('show', 4)]);
    });

    it('shows "Could not load {feedType} stories." when the request fails', async () => {
        mockFetch({ [apiUrls.feed('ask', 1)]: textResponse('boom', 500) });
        renderFeed('ask', 1);
        expect(await screen.findByText('Could not load ask stories.')).toBeInTheDocument();
        expect(screen.queryByRole('status')).toBeNull();
    });

    it('shows the error for a non-numeric page', async () => {
        mockFetch();
        renderFeed('newest', 'abc');
        expect(await screen.findByText('Could not load newest stories.')).toBeInTheDocument();
    });

    it('numbers page 1 from 1 with only a More link', async () => {
        mockFetch({ [apiUrls.feed('news', 1)]: testStories(30) });
        const { container } = renderFeed('news', 1);
        await screen.findByText('Story 1');

        expect(container.querySelector('ol')).toHaveAttribute('start', '1');
        expect(container.querySelector('ol')).toHaveClass('list-margin');
        expect(screen.queryByRole('link', { name: /Prev/ })).toBeNull();
        expect(screen.getByRole('link', { name: 'More ›' })).toHaveAttribute('href', '/news/2');
    });

    it('starts page 3 at 61 with Prev and More links', async () => {
        mockFetch({ [apiUrls.feed('newest', 3)]: testStories(30, 61) });
        const { container } = renderFeed('newest', 3);
        await screen.findByText('Story 61');

        expect(container.querySelector('ol')).toHaveAttribute('start', '61');
        expect(screen.getByRole('link', { name: /‹ Prev/ })).toHaveAttribute('href', '/newest/2');
        expect(screen.getByRole('link', { name: 'More ›' })).toHaveAttribute('href', '/newest/4');
    });

    it('hides More when the page has fewer than 30 stories', async () => {
        mockFetch({ [apiUrls.feed('news', 2)]: testStories(12, 31) });
        renderFeed('news', 2);
        await screen.findByText('Story 31');
        expect(screen.queryByRole('link', { name: /More/ })).toBeNull();
        expect(screen.getByRole('link', { name: /Prev/ })).toHaveAttribute('href', '/news/1');
    });

    it('shows the jobs header and no list margin on jobs', async () => {
        mockFetch({ [apiUrls.feed('jobs', 1)]: testStories(5) });
        const { container } = renderFeed('jobs', 1);
        await screen.findByText('Story 1');

        expect(container.querySelector('.job-header')).toHaveTextContent(
            'These are jobs at startups that were funded by Y Combinator.'
        );
        expect(screen.getByRole('link', { name: 'Triplebyte' })).toHaveAttribute(
            'href',
            'https://triplebyte.com/?ref=yc_jobs'
        );
        expect(container.querySelector('ol')).not.toHaveClass('list-margin');
    });

    it('has no jobs header on other feeds', async () => {
        mockFetch({ [apiUrls.feed('news', 1)]: testStories(3) });
        const { container } = renderFeed('news', 1);
        await screen.findByText('Story 1');
        expect(container.querySelector('.job-header')).toBeNull();
    });

    it('loads the next page and scrolls to top when More is clicked', async () => {
        mockFetch({
            [apiUrls.feed('news', 1)]: testStories(30),
            [apiUrls.feed('news', 2)]: testStories(30, 31),
        });
        const { user, container } = renderFeed('news', 1);
        await screen.findByText('Story 1');
        vi.mocked(window.scrollTo).mockClear();

        await user.click(screen.getByRole('link', { name: 'More ›' }));
        expect(await screen.findByText('Story 31')).toBeInTheDocument();
        expect(screen.queryByText('Story 1')).toBeNull();
        expect(container.querySelector('ol')).toHaveAttribute('start', '31');
        expect(window.scrollTo).toHaveBeenLastCalledWith(0, 0);
    });

    it('keeps the previous page on screen while the next page loads (Angular parity)', async () => {
        const next = deferred<Response>();
        mockFetch({
            [apiUrls.feed('news', 1)]: testStories(30),
            [apiUrls.feed('news', 2)]: () => next.promise,
        });
        const { user, container } = renderFeed('news', 1);
        await screen.findByText('Story 1');

        await user.click(screen.getByRole('link', { name: 'More ›' }));
        expect(screen.queryByRole('status')).toBeNull();
        expect(screen.getByText('Story 1')).toBeInTheDocument();
        expect(container.querySelector('ol')).toHaveAttribute('start', '1');

        await act(async () => next.resolve(jsonResponse(testStories(30, 31))));
        expect(await screen.findByText('Story 31')).toBeInTheDocument();
        expect(container.querySelector('ol')).toHaveAttribute('start', '31');
    });

    it('keeps the previous page (and no error) when the next page fails (Angular parity)', async () => {
        mockFetch({
            [apiUrls.feed('news', 1)]: testStories(30),
            [apiUrls.feed('news', 2)]: textResponse('boom', 500),
        });
        const { user, container } = renderFeed('news', 1);
        await screen.findByText('Story 1');

        await user.click(screen.getByRole('link', { name: 'More ›' }));
        await act(async () => {});
        expect(screen.queryByRole('alert')).toBeNull();
        expect(screen.getByText('Story 1')).toBeInTheDocument();
        expect(container.querySelector('ol')).toHaveAttribute('start', '1');
        expect(screen.getByRole('link', { name: 'More ›' })).toHaveAttribute('href', '/news/2');
    });

    it('scrolls to top on load', async () => {
        mockFetch({ [apiUrls.feed('news', 1)]: testStories(3) });
        renderFeed('news', 1);
        await screen.findByText('Story 1');
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('uses manual scroll restoration while mounted', async () => {
        window.history.scrollRestoration = 'auto';
        mockFetch({ [apiUrls.feed('news', 1)]: testStories(3) });
        const { unmount } = renderFeed('news', 1);
        await screen.findByText('Story 1');
        expect(window.history.scrollRestoration).toBe('manual');
        unmount();
        expect(window.history.scrollRestoration).toBe('auto');
    });
});
