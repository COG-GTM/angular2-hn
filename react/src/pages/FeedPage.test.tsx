import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { HN_API_BASE_URL } from '../api/hn';
import { FEED_NAMES, type FeedName, type Story } from '../api/types';
import { SettingsProvider } from '../hooks/useSettings';
import { mockFetch } from '../test/fetchMock';
import { newsPage1 } from '../test/fixtures/stories';
import { FeedPage, PAGE_SIZE, parsePage } from './FeedPage';

function fullPage(offset = 0): Story[] {
  return Array.from({ length: PAGE_SIZE }, (_, i) => ({
    ...newsPage1[0],
    id: offset + i + 1,
    title: `Story ${offset + i + 1}`,
  }));
}

function renderFeed(feed: FeedName, url: string) {
  const router = createMemoryRouter(
    FEED_NAMES.map((f) => ({ path: `/${f}`, element: <FeedPage key={f} feed={f} /> })),
    { initialEntries: [url] },
  );
  render(
    <SettingsProvider>
      <RouterProvider router={router} />
    </SettingsProvider>,
  );
  void feed;
  return router;
}

describe('parsePage', () => {
  it.each([
    [null, 1],
    ['', 1],
    ['1', 1],
    ['7', 7],
    ['0', 1],
    ['-2', 1],
    ['2.5', 1],
    ['abc', 1],
  ])('parsePage(%j) === %i', (raw, expected) => {
    expect(parsePage(raw)).toBe(expected);
  });
});

describe('FeedPage', () => {
  it.each(FEED_NAMES)('loads /%s page 1 by default', async (feed) => {
    const spy = mockFetch({ [`${HN_API_BASE_URL}/${feed}?page=1`]: newsPage1 });
    renderFeed(feed, `/${feed}`);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(await screen.findByText(newsPage1[0].title)).toBeInTheDocument();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('renders one list item per story, numbered from the page offset', async () => {
    mockFetch({ [`${HN_API_BASE_URL}/news?page=3`]: newsPage1 });
    renderFeed('news', '/news?page=3');
    const list = await screen.findByRole('list');
    expect(list).toHaveAttribute('start', '61');
    expect(within(list).getAllByRole('listitem')).toHaveLength(newsPage1.length);
  });

  it('shows only "More" on a full first page', async () => {
    mockFetch({ [`${HN_API_BASE_URL}/news?page=1`]: fullPage() });
    renderFeed('news', '/news');
    const nav = await screen.findByRole('navigation', { name: 'Pagination' });
    expect(within(nav).getByRole('link', { name: 'More ›' })).toHaveAttribute('href', '/news?page=2');
    expect(within(nav).queryByRole('link', { name: '‹ Prev' })).not.toBeInTheDocument();
  });

  it('shows only "Prev" on a short later page', async () => {
    mockFetch({ [`${HN_API_BASE_URL}/show?page=4`]: newsPage1 });
    renderFeed('show', '/show?page=4');
    const nav = await screen.findByRole('navigation', { name: 'Pagination' });
    expect(within(nav).getByRole('link', { name: '‹ Prev' })).toHaveAttribute('href', '/show?page=3');
    expect(within(nav).queryByRole('link', { name: 'More ›' })).not.toBeInTheDocument();
  });

  it('navigates More → Prev, refetching each page', async () => {
    const user = userEvent.setup();
    const spy = mockFetch({
      [`${HN_API_BASE_URL}/newest?page=1`]: fullPage(0),
      [`${HN_API_BASE_URL}/newest?page=2`]: fullPage(30),
    });
    const router = renderFeed('newest', '/newest');

    await user.click(await screen.findByRole('link', { name: 'More ›' }));
    expect(await screen.findByText('Story 31')).toBeInTheDocument();
    expect(router.state.location.search).toBe('?page=2');
    expect(screen.getByRole('list')).toHaveAttribute('start', '31');

    await user.click(screen.getByRole('link', { name: '‹ Prev' }));
    expect(await screen.findByText('Story 1')).toBeInTheDocument();
    expect(router.state.location.search).toBe('?page=1');
    expect(spy).toHaveBeenCalledTimes(3);
  });

  it('shows a feed-specific error when the API fails', async () => {
    mockFetch({ [`${HN_API_BASE_URL}/ask?page=1`]: { status: 500, body: {} } });
    renderFeed('ask', '/ask');
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load ask stories.');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('shows an error when the network request rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    renderFeed('news', '/news');
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load news stories.');
  });

  it('shows the jobs header only on /jobs', async () => {
    mockFetch({
      [`${HN_API_BASE_URL}/jobs?page=1`]: [newsPage1[2]],
      [`${HN_API_BASE_URL}/news?page=1`]: newsPage1,
    });
    renderFeed('jobs', '/jobs');
    expect(await screen.findByText(/jobs at startups that were funded by Y Combinator/)).toBeInTheDocument();
    expect(screen.getByRole('list')).not.toHaveClass('list-margin');
  });

  it('omits the jobs header on other feeds', async () => {
    mockFetch({ [`${HN_API_BASE_URL}/news?page=1`]: newsPage1 });
    renderFeed('news', '/news');
    await screen.findByText(newsPage1[0].title);
    expect(screen.queryByText(/funded by Y Combinator/)).not.toBeInTheDocument();
    expect(screen.getByRole('list')).toHaveClass('list-margin');
  });

  it('aborts the previous request when the page changes', async () => {
    const user = userEvent.setup();
    const signals: AbortSignal[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, init: RequestInit) => {
        signals.push(init.signal!);
        if (url.endsWith('page=1')) {
          return Promise.resolve(new Response(JSON.stringify(fullPage())));
        }
        return new Promise<Response>(() => {});
      }),
    );
    renderFeed('news', '/news');
    await user.click(await screen.findByRole('link', { name: 'More ›' }));
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(signals).toHaveLength(2);
    expect(signals[0].aborted).toBe(true);
    expect(signals[1].aborted).toBe(false);
  });
});
