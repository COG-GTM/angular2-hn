import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNavigate } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { jobStory, makeFeed } from '../../test/fixtures';
import { mockFetch, renderWithProviders } from '../../test/render';
import type { FeedType } from '../../types';
import { FeedPage } from './FeedPage';

/** Like mockFetch, but requests whose URL contains `gatedKey` stay pending until `open()` is called. */
function gatedFetch(routes: Record<string, unknown>, gatedKey: string) {
  const base = mockFetch(routes);
  let open: () => void = () => {};
  const gate = new Promise<void>((r) => (open = r));
  const fn = vi.fn((input: RequestInfo | URL, _init?: RequestInit) =>
    String(input).includes(gatedKey) ? gate.then(() => base(input)) : base(input)
  );
  vi.stubGlobal('fetch', fn);
  return { fn, open };
}

function renderFeed(feedType: FeedType, route: string) {
  return renderWithProviders(<FeedPage feedType={feedType} />, { route, path: `/${feedType}/:page` });
}

describe('FeedPage', () => {
  it('shows the loader while the feed is loading', () => {
    gatedFetch({ '/news?page=1': makeFeed(30) }, '/news?page=1');
    renderFeed('news', '/news/1');
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it('renders the stories, fetches the right page and scrolls to top', async () => {
    const fetchMock = mockFetch({ '/news?page=1': makeFeed(30) });
    renderFeed('news', '/news/1');
    expect(await screen.findByText('Story 1')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/news?page=1', expect.anything());
    expect(document.querySelectorAll('li.post')).toHaveLength(30);
    expect(document.querySelector('ol')).toHaveAttribute('start', '1');
    expect(document.querySelector('ol')).toHaveClass('list-margin');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('starts the list at 31 on page 2 and shows Prev and More', async () => {
    mockFetch({ '/newest?page=2': makeFeed(30, 31) });
    renderFeed('newest', '/newest/2');
    await screen.findByText('Story 31');
    expect(document.querySelector('ol')).toHaveAttribute('start', '31');
    expect(screen.getByRole('link', { name: '‹ Prev' })).toHaveAttribute('href', '/newest/1');
    expect(screen.getByRole('link', { name: '‹ Prev' })).toHaveClass('prev');
    expect(screen.getByRole('link', { name: 'More ›' })).toHaveAttribute('href', '/newest/3');
    expect(screen.getByRole('link', { name: 'More ›' })).toHaveClass('more');
  });

  it('hides Prev on page 1 and More when fewer than 30 items', async () => {
    mockFetch({ '/show?page=1': makeFeed(12) });
    renderFeed('show', '/show/1');
    await screen.findByText('Story 1');
    expect(screen.queryByText('‹ Prev')).not.toBeInTheDocument();
    expect(screen.queryByText('More ›')).not.toBeInTheDocument();
  });

  it('defaults to page 1 for a non-numeric page param', async () => {
    const fetchMock = mockFetch({ '/ask?page=1': makeFeed(3) });
    renderFeed('ask', '/ask/abc');
    await screen.findByText('Story 1');
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/ask?page=1'), expect.anything());
    expect(document.querySelector('ol')).toHaveAttribute('start', '1');
  });

  it('shows the jobs header and no list-margin on the jobs feed', async () => {
    mockFetch({ '/jobs?page=1': [jobStory] });
    renderFeed('jobs', '/jobs/1');
    await screen.findByText(jobStory.title);
    const header = document.querySelector('p.job-header');
    expect(header).toHaveTextContent('These are jobs at startups that were funded by Y Combinator.');
    expect(screen.getByRole('link', { name: 'Triplebyte' })).toHaveAttribute(
      'href',
      'https://triplebyte.com/?ref=yc_jobs'
    );
    expect(document.querySelector('ol')).not.toHaveClass('list-margin');
  });

  it('does not show the jobs header on other feeds', async () => {
    mockFetch({ '/news?page=1': makeFeed(2) });
    renderFeed('news', '/news/1');
    await screen.findByText('Story 1');
    expect(document.querySelector('.job-header')).not.toBeInTheDocument();
  });

  it('shows an error message when the request fails', async () => {
    mockFetch({ '/ask?page=1': { __status: 500 } });
    renderFeed('ask', '/ask/1');
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load ask stories.');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(document.querySelector('ol')).not.toBeInTheDocument();
  });

  it('shows an error message on a network error', async () => {
    mockFetch({ '/news?page=1': new TypeError('Failed to fetch') });
    renderFeed('news', '/news/1');
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load news stories.');
  });

  it('refetches and shows the loader again when the page param changes', async () => {
    const { fn: fetchMock, open } = gatedFetch(
      { '/news?page=1': makeFeed(30, 1), '/news?page=2': makeFeed(30, 31) },
      '/news?page=2'
    );
    renderFeed('news', '/news/1');
    await screen.findByText('Story 1');

    await userEvent.click(screen.getByRole('link', { name: 'More ›' }));

    expect(fetchMock).toHaveBeenLastCalledWith(expect.stringContaining('/news?page=2'), expect.anything());
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    expect(screen.queryByText('Story 1')).not.toBeInTheDocument();

    open();
    expect(await screen.findByText('Story 31')).toBeInTheDocument();
    expect(document.querySelector('ol')).toHaveAttribute('start', '31');
  });

  it("shows the loader, not the previous visit's stories, when navigating back before the next page loads", async () => {
    let page1Calls = 0;
    const page1 = mockFetch({ '/news?page=1': makeFeed(30, 1) });
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/news?page=1') && ++page1Calls === 1) return page1(input);
      return new Promise<Response>(() => {});
    });
    vi.stubGlobal('fetch', fetchMock);
    function Back() {
      const navigate = useNavigate();
      return <button onClick={() => navigate(-1)}>back</button>;
    }
    renderWithProviders(
      <>
        <FeedPage feedType="news" />
        <Back />
      </>,
      { route: '/news/1', path: '/news/:page' }
    );
    await screen.findByText('Story 1');

    await userEvent.click(screen.getByRole('link', { name: 'More ›' }));
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'back' }));
    expect(fetchMock).toHaveBeenLastCalledWith(expect.stringContaining('/news?page=1'), expect.anything());
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    expect(screen.queryByText('Story 1')).not.toBeInTheDocument();
  });

  it('aborts the in-flight request on unmount', async () => {
    const { fn: fetchMock } = gatedFetch({ '/news?page=1': makeFeed(30) }, '/news?page=1');
    const { unmount } = renderFeed('news', '/news/1');
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const signal = fetchMock.mock.calls[0][1]!.signal!;
    expect(signal.aborted).toBe(false);
    unmount();
    expect(signal.aborted).toBe(true);
  });
});
