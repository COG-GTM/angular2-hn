import { act, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { apiUrls } from '../../shared/api';
import type { FeedType, Story } from '../../shared/models';
import { deferred, mockFetch, renderWithProviders, textResponse } from '../../shared/test-utils';
import { FeedItem, FeedList } from './index';

function story(id: number, overrides: Partial<Story> = {}): Story {
    return {
        id,
        title: `Story ${id}`,
        points: 10 + id,
        user: `user${id}`,
        time: 0,
        time_ago: '3 hours ago',
        type: 'link',
        url: `https://example.com/${id}`,
        domain: 'example.com',
        comments: [],
        comments_count: id,
        ...overrides,
    };
}

function stories(count: number, offset = 0): Story[] {
    return Array.from({ length: count }, (_, i) => story(offset + i + 1));
}

function renderFeed(feedType: FeedType, page: string) {
    return renderWithProviders(<FeedList feedType={feedType} />, {
        route: `/${feedType}/${page}`,
        path: `/${feedType}/:page`,
    });
}

describe('FeedList', () => {
    afterEach(() => {
        window.history.scrollRestoration = 'auto';
    });

    it('shows the loader while the feed is pending, then the stories', async () => {
        const pending = deferred();
        mockFetch({ [apiUrls.feed('news', 1)]: () => pending.promise });
        const { container } = renderFeed('news', '1');

        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(container.querySelector('ol')).toBeNull();

        await act(async () => pending.resolve(stories(3)));
        expect(await screen.findAllByText('Story 1')).not.toHaveLength(0);
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
        expect(container.querySelectorAll('li.post')).toHaveLength(3);
    });

    it('requests the :page from the API and numbers the list from (page - 1) * 30 + 1', async () => {
        const fetch = mockFetch({ [apiUrls.feed('newest', 3)]: stories(30, 60) });
        const { container } = renderFeed('newest', '3');

        await screen.findAllByText('Story 61');
        expect(fetch.callsTo(apiUrls.feed('newest', 3))).toHaveLength(1);
        expect(container.querySelector('ol')).toHaveAttribute('start', '61');
    });

    it('starts the list at 1 on the first page', async () => {
        mockFetch({ [apiUrls.feed('news', 1)]: stories(30) });
        const { container } = renderFeed('news', '1');
        await screen.findAllByText('Story 1');
        expect(container.querySelector('ol')).toHaveAttribute('start', '1');
    });

    it('hides Prev on page 1 and shows More only for a full page of 30', async () => {
        mockFetch({ [apiUrls.feed('news', 1)]: stories(30) });
        renderFeed('news', '1');
        const more = await screen.findByRole('link', { name: 'More ›' });
        expect(more).toHaveAttribute('href', '/news/2');
        expect(more).toHaveClass('more');
        expect(screen.queryByRole('link', { name: '‹ Prev' })).not.toBeInTheDocument();
    });

    it('shows Prev after page 1 and hides More when fewer than 30 stories come back', async () => {
        mockFetch({ [apiUrls.feed('show', 2)]: stories(12, 30) });
        renderFeed('show', '2');
        const prev = await screen.findByRole('link', { name: '‹ Prev' });
        expect(prev).toHaveAttribute('href', '/show/1');
        expect(prev).toHaveClass('prev');
        expect(screen.queryByRole('link', { name: 'More ›' })).not.toBeInTheDocument();
    });

    it('shows the jobs header and no list-margin on the jobs feed', async () => {
        mockFetch({ [apiUrls.feed('jobs', 1)]: [story(1, { type: 'job', points: null, user: null })] });
        const { container } = renderFeed('jobs', '1');
        await screen.findAllByText('Story 1');

        const header = container.querySelector('p.job-header');
        expect(header).toHaveTextContent('These are jobs at startups that were funded by Y Combinator.');
        expect(within(header as HTMLElement).getByRole('link', { name: 'Triplebyte' })).toHaveAttribute(
            'href',
            'https://triplebyte.com/?ref=yc_jobs'
        );
        expect(container.querySelector('ol')).not.toHaveClass('list-margin');
    });

    it('adds list-margin and no jobs header on other feeds', async () => {
        mockFetch({ [apiUrls.feed('ask', 1)]: stories(2) });
        const { container } = renderFeed('ask', '1');
        await screen.findAllByText('Story 1');
        expect(container.querySelector('p.job-header')).toBeNull();
        expect(container.querySelector('ol')).toHaveClass('list-margin');
    });

    it('shows the error message when the feed request fails', async () => {
        mockFetch({ [apiUrls.feed('news', 1)]: textResponse('boom', 500) });
        const { container } = renderFeed('news', '1');
        expect(await screen.findByRole('alert')).toHaveTextContent('Could not load news stories.');
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
        expect(container.querySelector('ol')).toBeNull();
    });

    it('treats an invalid page as an error without calling the API', async () => {
        const fetch = mockFetch({});
        renderFeed('newest', 'abc');
        expect(await screen.findByRole('alert')).toHaveTextContent('Could not load newest stories.');
        expect(fetch.calls).toHaveLength(0);
    });

    it('does not show the previous page as current while the next page loads', async () => {
        const next = deferred();
        mockFetch({ [apiUrls.feed('news', 1)]: stories(30), [apiUrls.feed('news', 2)]: () => next.promise });
        const { user, container } = renderFeed('news', '1');

        await user.click(await screen.findByRole('link', { name: 'More ›' }));
        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.queryByText('Story 1')).not.toBeInTheDocument();

        await act(async () => next.resolve(stories(30, 30)));
        await screen.findAllByText('Story 31');
        expect(container.querySelector('ol')).toHaveAttribute('start', '31');
        expect(screen.getByRole('link', { name: '‹ Prev' })).toHaveAttribute('href', '/news/1');
    });

    it('scrolls to the top on mount and on every page change', async () => {
        mockFetch({ [apiUrls.feed('news', 1)]: stories(30), [apiUrls.feed('news', 2)]: stories(30, 30) });
        const scrollTo = vi.mocked(window.scrollTo);
        scrollTo.mockClear();
        const { user } = renderFeed('news', '1');
        expect(scrollTo).toHaveBeenCalledWith(0, 0);

        scrollTo.mockClear();
        await user.click(await screen.findByRole('link', { name: 'More ›' }));
        await waitFor(() => expect(scrollTo).toHaveBeenCalledWith(0, 0));
    });

    it('sets history.scrollRestoration to manual while mounted and restores it on unmount', () => {
        mockFetch({ [apiUrls.feed('news', 1)]: stories(1) });
        window.history.scrollRestoration = 'auto';
        const { unmount } = renderFeed('news', '1');
        expect(window.history.scrollRestoration).toBe('manual');
        unmount();
        expect(window.history.scrollRestoration).toBe('auto');
    });
});

describe('FeedItem', () => {
    it('renders a story with title, domain, points, user and comment links', () => {
        const { container } = renderWithProviders(<FeedItem item={story(7, { comments_count: 5 })} />);

        const titles = screen.getAllByRole('link', { name: 'Story 7' });
        expect(titles).toHaveLength(1);
        expect(titles[0]).toHaveAttribute('href', 'https://example.com/7');
        expect(titles[0]).not.toHaveAttribute('target');
        expect(titles[0]).not.toHaveAttribute('rel');
        expect(container.querySelector('.domain')).toHaveTextContent('(example.com)');

        const palm = container.querySelector('.subtext-palm') as HTMLElement;
        expect(within(palm).getByRole('link', { name: 'user7' })).toHaveAttribute('href', '/user/user7');
        expect(within(palm).getByText('17 ★')).toHaveClass('right');
        expect(within(palm).getByRole('link', { name: /• 5 comments/ })).toHaveAttribute('href', '/item/7');

        const laptop = container.querySelector('.subtext-laptop') as HTMLElement;
        expect(laptop).toHaveTextContent('17 points by user7 3 hours ago | 5 comments');
        expect(within(laptop).getByRole('link', { name: '5 comments' })).toHaveAttribute('href', '/item/7');
        expect(laptop.querySelector('.item-details')).not.toBeNull();
    });

    it('uses the comment pipe labels (discuss / 1 comment)', () => {
        renderWithProviders(
            <>
                <FeedItem item={story(1, { comments_count: 0 })} />
                <FeedItem item={story(2, { comments_count: 1 })} />
            </>
        );
        expect(screen.getAllByRole('link', { name: /discuss/ })).toHaveLength(2);
        expect(screen.getAllByRole('link', { name: /^(• )?1 comment$/ })).toHaveLength(2);
    });

    it('links ask/show posts without an external url to /item/:id and hides the domain', () => {
        const { container } = renderWithProviders(
            <FeedItem item={story(9, { type: 'ask', url: 'item?id=9', domain: undefined })} />
        );
        expect(screen.getByRole('link', { name: 'Story 9' })).toHaveAttribute('href', '/item/9');
        expect(container.querySelector('.domain')).toBeNull();
        expect(screen.getAllByRole('link', { name: 'user9' })).toHaveLength(2);
    });

    it('renders job posts without points, user or comment links', () => {
        const { container } = renderWithProviders(
            <FeedItem item={story(3, { type: 'job', points: null, user: null, url: 'item?id=3', domain: undefined })} />
        );
        expect(screen.getByRole('link', { name: 'Story 3' })).toHaveAttribute('href', '/item/3');
        expect(screen.getAllByRole('link')).toHaveLength(1);
        expect(container.querySelector('.subtext-palm .name')).toBeNull();
        expect(container.querySelector('.subtext-laptop')).toHaveTextContent(/^3 hours ago$/);
        expect(container.querySelector('.item-details')).toBeNull();
    });

    it('applies titleFontSize, listSpacing and openLinkInNewTab from settings', () => {
        localStorage.setItem('titleFontSize', '22');
        localStorage.setItem('listSpacing', '12');
        localStorage.setItem('openLinkInNewTab', 'true');
        const { container } = renderWithProviders(
            <>
                <FeedItem item={story(1)} />
                <FeedItem item={story(2, { type: 'ask', url: 'item?id=2' })} />
            </>
        );

        const external = screen.getByRole('link', { name: 'Story 1' });
        expect(external).toHaveStyle({ fontSize: '22px' });
        expect(external).toHaveAttribute('target', '_blank');
        expect(external).toHaveAttribute('rel', 'noopener');

        const internal = screen.getByRole('link', { name: 'Story 2' });
        expect(internal).toHaveStyle({ fontSize: '22px' });
        expect(internal).not.toHaveAttribute('target');

        const rows = container.querySelectorAll<HTMLElement>('.feed-item > div');
        expect(rows).toHaveLength(2);
        rows.forEach((row) => expect(row).toHaveStyle({ marginBottom: '12px' }));
    });

    it('uses the Angular defaults (16px titles, 0px spacing, same tab) with nothing saved', () => {
        const { container } = renderWithProviders(<FeedItem item={story(1)} />);
        const title = screen.getByRole('link', { name: 'Story 1' });
        expect(title).toHaveStyle({ fontSize: '16px' });
        expect(title).not.toHaveAttribute('target');
        expect(container.querySelector('.feed-item > div')).toHaveStyle({ marginBottom: '0px' });
    });

    it('does not render unsafe external urls as hrefs', () => {
        renderWithProviders(<FeedItem item={story(4, { url: 'http\u0000javascript:alert(1)' })} />);
        expect(screen.getByRole('link', { name: 'Story 4' }).getAttribute('href')).not.toMatch(/javascript/);
    });
});
