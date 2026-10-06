import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { vi, type Mock } from 'vitest';
import type { FeedName, Story } from '../shared/models';
import { fetchFeed } from '../shared/services/hackernewsApi';
import { makeStories } from '../test/feedStories';
import { renderWithProviders } from '../test/renderWithProviders';
import Feed from './Feed';

vi.mock('../shared/services/hackernewsApi');

const fetchFeedMock = fetchFeed as Mock<typeof fetchFeed>;

interface Deferred {
    resolve: (stories: Story[]) => void;
    reject: (error: unknown) => void;
}

function deferFeed(): Deferred {
    const deferred = {} as Deferred;
    fetchFeedMock.mockImplementationOnce(
        () =>
            new Promise<Story[]>((resolve, reject) => {
                deferred.resolve = resolve;
                deferred.reject = reject;
            })
    );
    return deferred;
}

function renderFeed(feedType: FeedName = 'news', route = `/${feedType}/1`) {
    return renderWithProviders(
        <Routes>
            <Route path={`/${feedType}`} element={<Feed feedType={feedType} />} />
            <Route path={`/${feedType}/:page`} element={<Feed feedType={feedType} />} />
        </Routes>,
        { route }
    );
}

const feedRoot = () => screen.getByTestId('feed');
const posts = () => document.querySelectorAll('ol > li.post');
const signalOfCall = (index: number) => fetchFeedMock.mock.calls[index][2]!;

describe('Feed', () => {
    let scrollTo: Mock;

    beforeEach(() => {
        scrollTo = vi.fn();
        vi.stubGlobal('scrollTo', scrollTo);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('shows the loader, then the list of stories', async () => {
        const request = deferFeed();
        renderFeed('news', '/news/1');

        expect(screen.getByRole('status')).toHaveTextContent('Loading...');
        expect(feedRoot()).toHaveAttribute('data-feed-type', 'news');
        expect(feedRoot()).toHaveAttribute('data-page', '1');
        expect(fetchFeedMock).toHaveBeenCalledWith('news', 1, expect.any(AbortSignal));
        expect(scrollTo).not.toHaveBeenCalled();

        await act(async () => request.resolve(makeStories(3)));

        expect(screen.queryByRole('status')).not.toBeInTheDocument();
        expect(posts()).toHaveLength(3);
        expect(posts()[0].querySelector('.feed-item')).toHaveTextContent('Story 1');
        expect(screen.getByRole('link', { name: 'Story 2' })).toHaveAttribute('href', 'https://example.com/2');
        expect(scrollTo).toHaveBeenCalledWith(0, 0);
        expect(feedRoot()).toHaveClass('main-content');
    });

    it('shows the error message when the feed fails to load', async () => {
        fetchFeedMock.mockRejectedValueOnce(new Error('boom'));
        renderFeed('show', '/show/1');

        expect(await screen.findByRole('alert')).toHaveTextContent('Could not load show stories.');
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
        expect(document.querySelector('ol')).toBeNull();
        expect(feedRoot()).toHaveAttribute('data-feed-type', 'show');
        expect(scrollTo).not.toHaveBeenCalled();
    });

    it('defaults to page 1 when there is no page param', async () => {
        fetchFeedMock.mockResolvedValueOnce(makeStories(2));
        renderFeed('newest', '/newest');

        await waitFor(() => expect(posts()).toHaveLength(2));
        expect(fetchFeedMock).toHaveBeenCalledWith('newest', 1, expect.any(AbortSignal));
        expect(document.querySelector('ol')).toHaveAttribute('start', '1');
    });

    it('falls back to page 1 for a non-numeric page param', async () => {
        fetchFeedMock.mockResolvedValueOnce(makeStories(2));
        renderFeed('news', '/news/abc');

        await waitFor(() => expect(posts()).toHaveLength(2));
        expect(fetchFeedMock).toHaveBeenCalledWith('news', 1, expect.any(AbortSignal));
    });

    it('numbers the list from the page offset', async () => {
        fetchFeedMock.mockResolvedValueOnce(makeStories(30, 61));
        renderFeed('news', '/news/3');

        await waitFor(() => expect(posts()).toHaveLength(30));
        expect(fetchFeedMock).toHaveBeenCalledWith('news', 3, expect.any(AbortSignal));
        expect(document.querySelector('ol')).toHaveAttribute('start', '61');
    });

    it('on page 1 with 30 items shows More but not Prev', async () => {
        fetchFeedMock.mockResolvedValueOnce(makeStories(30));
        renderFeed('news', '/news/1');

        const more = await screen.findByRole('link', { name: 'More ›' });
        expect(more).toHaveAttribute('href', '/news/2');
        expect(more).toHaveClass('more');
        expect(screen.queryByRole('link', { name: '‹ Prev' })).not.toBeInTheDocument();
    });

    it('on page 2 with fewer than 30 items shows Prev but not More', async () => {
        fetchFeedMock.mockResolvedValueOnce(makeStories(12, 31));
        renderFeed('ask', '/ask/2');

        const prev = await screen.findByRole('link', { name: '‹ Prev' });
        expect(prev).toHaveAttribute('href', '/ask/1');
        expect(prev).toHaveClass('prev');
        expect(screen.queryByRole('link', { name: 'More ›' })).not.toBeInTheDocument();
    });

    it('on page 2 with 30 items shows both links', async () => {
        fetchFeedMock.mockResolvedValueOnce(makeStories(30, 31));
        renderFeed('newest', '/newest/2');

        const nav = (await screen.findByRole('link', { name: 'More ›' })).closest('.nav') as HTMLElement;
        expect(within(nav).getByRole('link', { name: '‹ Prev' })).toHaveAttribute('href', '/newest/1');
        expect(within(nav).getByRole('link', { name: 'More ›' })).toHaveAttribute('href', '/newest/3');
    });

    it('on page 1 with fewer than 30 items shows no pagination', async () => {
        fetchFeedMock.mockResolvedValueOnce(makeStories(5));
        renderFeed('news', '/news/1');

        await waitFor(() => expect(posts()).toHaveLength(5));
        expect(document.querySelector('.nav')).toBeEmptyDOMElement();
    });

    it('renders the jobs header without list margin only for jobs', async () => {
        fetchFeedMock.mockResolvedValueOnce(makeStories(2, 1, { type: 'job' }));
        renderFeed('jobs', '/jobs/1');

        const header = await screen.findByText(/These are jobs at startups that were funded by Y Combinator/);
        expect(header).toHaveClass('job-header');
        expect(within(header).getByRole('link', { name: 'Triplebyte' })).toHaveAttribute(
            'href',
            'https://triplebyte.com/?ref=yc_jobs'
        );
        expect(document.querySelector('ol')).not.toHaveClass('list-margin');
    });

    it.each(['news', 'newest', 'show', 'ask'] as const)('omits the jobs header for %s', async (feedType) => {
        fetchFeedMock.mockResolvedValueOnce(makeStories(2));
        renderFeed(feedType);

        await waitFor(() => expect(posts()).toHaveLength(2));
        expect(document.querySelector('.job-header')).toBeNull();
        expect(document.querySelector('ol')).toHaveClass('list-margin');
    });

    it('refetches on page change and aborts the previous request', async () => {
        fetchFeedMock.mockResolvedValueOnce(makeStories(30));
        renderFeed('news', '/news/1');

        const page2 = deferFeed();
        await userEvent.click(await screen.findByRole('link', { name: 'More ›' }));

        expect(screen.getByTestId('location')).toHaveTextContent('/news/2');
        expect(feedRoot()).toHaveAttribute('data-page', '2');
        expect(fetchFeedMock).toHaveBeenLastCalledWith('news', 2, expect.any(AbortSignal));
        expect(signalOfCall(0).aborted).toBe(true);
        expect(signalOfCall(1).aborted).toBe(false);
        expect(screen.getByRole('status')).toBeInTheDocument();

        await act(async () => page2.resolve(makeStories(4, 31)));
        expect(posts()).toHaveLength(4);
        expect(document.querySelector('ol')).toHaveAttribute('start', '31');
        expect(scrollTo).toHaveBeenCalledTimes(2);

        fetchFeedMock.mockResolvedValueOnce(makeStories(30));
        await userEvent.click(screen.getByRole('link', { name: '‹ Prev' }));
        expect(screen.getByTestId('location')).toHaveTextContent('/news/1');
        await waitFor(() => expect(posts()).toHaveLength(30));
        expect(signalOfCall(1).aborted).toBe(true);
    });

    it('aborts the request on unmount and ignores the AbortError', async () => {
        const request = deferFeed();
        const { unmount } = renderFeed('news', '/news/1');
        const signal = signalOfCall(0);

        unmount();
        expect(signal.aborted).toBe(true);
        await act(async () => request.reject(new DOMException('The operation was aborted.', 'AbortError')));
        expect(scrollTo).not.toHaveBeenCalled();
    });

    it('does not show an error for an AbortError even if the signal was not aborted', async () => {
        fetchFeedMock.mockRejectedValueOnce(new DOMException('The operation was aborted.', 'AbortError'));
        renderFeed('news', '/news/1');

        await act(async () => {});
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('does not apply a response that resolves after unmount', async () => {
        const request = deferFeed();
        const { unmount } = renderFeed('news', '/news/1');
        unmount();
        await act(async () => request.resolve(makeStories(3)));
        expect(scrollTo).not.toHaveBeenCalled();
    });
});
