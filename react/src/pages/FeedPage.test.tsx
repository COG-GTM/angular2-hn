import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { hackerNewsApi } from '../api/hackernews';
import { FEED_TYPES, type FeedType, type HackerNewsApi, type Story } from '../api/types';
import { routerFuture } from '../routes';
import { SettingsProvider } from '../settings/SettingsProvider';
import { FeedPage } from './FeedPage';

function makeItems(count: number, type: Story['type'] = 'link'): Story[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Story ${i + 1}`,
    points: type === 'job' ? null : 10,
    user: type === 'job' ? null : 'someone',
    time: 0,
    time_ago: '1 hour ago',
    type,
    url: `https://example.com/${i}`,
    domain: 'example.com',
    comments_count: 2,
  }));
}

function renderFeed(path: string) {
  const router = createMemoryRouter(
    FEED_TYPES.map((feedType) => ({
      path: `/${feedType}/:page`,
      element: <FeedPage key={feedType} feedType={feedType} />,
    })),
    { initialEntries: [path], future: routerFuture },
  );
  const view = render(
    <SettingsProvider>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </SettingsProvider>,
  );
  return { router, ...view };
}

describe('FeedPage', () => {
  let fetchFeed: MockInstance<HackerNewsApi['fetchFeed']>;
  let scrollTo: MockInstance<typeof window.scrollTo>;

  beforeEach(() => {
    fetchFeed = vi.spyOn(hackerNewsApi, 'fetchFeed');
    scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('shows the loader, then page 1 with "More ›" only', async () => {
    fetchFeed.mockResolvedValue(makeItems(30));
    const { container } = renderFeed('/news/1');
    expect(container.querySelector('.app-feed .main-content .app-loader')).not.toBeNull();

    await screen.findByText('Story 1');
    expect(fetchFeed).toHaveBeenCalledWith('news', 1, expect.any(AbortSignal));
    const ol = container.querySelector('ol')!;
    expect(ol).toHaveAttribute('start', '1');
    expect(ol).toHaveClass('list-margin');
    expect(container.querySelectorAll('ol > li.post > .app-item.item-block')).toHaveLength(30);
    expect(container.querySelector('.nav .prev')).toBeNull();
    expect(container.querySelector('.nav .more')).toHaveAttribute('href', '/news/2');
    expect(container.querySelector('.nav .more')!.textContent).toBe(' More › ');
    expect(container.querySelector('.job-header')).toBeNull();
    expect(container.querySelector('.app-loader')).toBeNull();
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('numbers page 2 from 31 and shows both prev and more', async () => {
    fetchFeed.mockResolvedValue(makeItems(30));
    const { container } = renderFeed('/news/2');
    await screen.findByText('Story 1');
    expect(container.querySelector('ol')).toHaveAttribute('start', '31');
    expect(container.querySelector('.nav .prev')).toHaveAttribute('href', '/news/1');
    expect(container.querySelector('.nav .prev')!.textContent).toBe(' ‹ Prev ');
    expect(container.querySelector('.nav .more')).toHaveAttribute('href', '/news/3');
  });

  it('hides "More ›" when the page is not full', async () => {
    fetchFeed.mockResolvedValue(makeItems(19));
    const { container } = renderFeed('/ask/3');
    await screen.findByText('Story 1');
    expect(container.querySelector('ol')).toHaveAttribute('start', '61');
    expect(container.querySelector('.nav .prev')).toHaveAttribute('href', '/ask/2');
    expect(container.querySelector('.nav .more')).toBeNull();
  });

  it('renders the jobs header and no list-margin for jobs', async () => {
    fetchFeed.mockResolvedValue(makeItems(30, 'job'));
    const { container } = renderFeed('/jobs/1');
    await screen.findByText('Story 1');
    const header = container.querySelector('p.job-header')!;
    expect(header.textContent).toBe(
      'These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC startup through Triplebyte.',
    );
    expect(header.querySelector('a')).toHaveAttribute('href', 'https://triplebyte.com/?ref=yc_jobs');
    expect(container.querySelector('ol')).not.toHaveClass('list-margin');
    expect(container.querySelector('.subtext-laptop')!.textContent).toBe(' 1 hour ago ');
  });

  it.each<FeedType>(['news', 'newest', 'show', 'ask', 'jobs'])('shows the Angular error message for %s', async (feed) => {
    fetchFeed.mockRejectedValue(new Error('boom'));
    const { container } = renderFeed(`/${feed}/1`);
    await screen.findByText(`Could not load ${feed} stories.`);
    expect(container.querySelector('.app-error-message')).not.toBeNull();
    expect(container.querySelector('ol')).toBeNull();
    expect(container.querySelector('.app-loader')).toBeNull();
  });

  it('refetches when the page changes', async () => {
    fetchFeed.mockResolvedValue(makeItems(30));
    const { router, container } = renderFeed('/newest/1');
    await screen.findByText('Story 1');
    await act(() => router.navigate('/newest/2'));
    await waitFor(() => expect(container.querySelector('ol')).toHaveAttribute('start', '31'));
    expect(fetchFeed).toHaveBeenLastCalledWith('newest', 2, expect.any(AbortSignal));
  });

  it('refetches when the feed type changes', async () => {
    fetchFeed.mockResolvedValue(makeItems(30));
    const { router } = renderFeed('/news/1');
    await screen.findByText('Story 1');
    await act(() => router.navigate('/show/1'));
    await waitFor(() => expect(fetchFeed).toHaveBeenLastCalledWith('show', 1, expect.any(AbortSignal)));
  });
});
