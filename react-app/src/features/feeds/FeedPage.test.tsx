import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

import { fetchFeed } from '../../api/hackernews';
import type { FeedType, Story } from '../../models';
import { renderWithProviders } from '../../test/renderWithProviders';
import FeedPage from './FeedPage';

vi.mock('../../api/hackernews');

const mockFetchFeed = vi.mocked(fetchFeed);

function stories(count: number, firstId = 1): Story[] {
  return Array.from({ length: count }, (_, i) => ({
    id: firstId + i,
    title: `Story ${firstId + i}`,
    points: 10,
    user: 'pg',
    time: 0,
    time_ago: '1 hour ago',
    type: 'link',
    url: `https://example.com/${firstId + i}`,
    domain: 'example.com',
    comments: [],
    comments_count: 2,
  }));
}

function renderFeed(feedType: FeedType, route: string) {
  return renderWithProviders(
    <Routes>
      <Route path={`/${feedType}/:page`} element={<FeedPage feedType={feedType} />} />
    </Routes>,
    { route, path: '*' }
  );
}

describe('FeedPage', () => {
  beforeEach(() => {
    mockFetchFeed.mockReset();
    vi.mocked(window.scrollTo).mockClear();
  });

  it('shows the loader while the feed loads', () => {
    mockFetchFeed.mockReturnValue(new Promise(() => {}));
    const { container } = renderFeed('news', '/news/1');

    expect(container.querySelector('.main-content .loading-section')).toBeInTheDocument();
    expect(mockFetchFeed).toHaveBeenCalledWith('news', 1, expect.any(AbortSignal));
  });

  it('shows an error message when the feed fails', async () => {
    mockFetchFeed.mockRejectedValue(new Error('boom'));
    const { container } = renderFeed('newest', '/newest/1');

    expect(await screen.findByText('Could not load newest stories.')).toHaveClass('error-section');
    expect(container.querySelector('.loading-section')).not.toBeInTheDocument();
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('renders the first page with More but no Prev, and scrolls to top', async () => {
    mockFetchFeed.mockResolvedValue(stories(30));
    const { container } = renderFeed('news', '/news/1');

    expect(await screen.findByText('Story 1')).toBeInTheDocument();
    const list = container.querySelector('ol')!;
    expect(list).toHaveAttribute('start', '1');
    expect(list).toHaveClass('list-margin');
    expect(list.querySelectorAll('li.post')).toHaveLength(30);
    expect(screen.queryByText('‹ Prev')).not.toBeInTheDocument();
    expect(screen.getByText('More ›')).toHaveAttribute('href', '/news/2');
    expect(container.querySelector('.job-header')).not.toBeInTheDocument();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('numbers later pages and hides More on a short page', async () => {
    mockFetchFeed.mockResolvedValue(stories(12, 61));
    const { container } = renderFeed('show', '/show/3');

    expect(await screen.findByText('Story 61')).toBeInTheDocument();
    expect(mockFetchFeed).toHaveBeenCalledWith('show', 3, expect.any(AbortSignal));
    expect(container.querySelector('ol')).toHaveAttribute('start', '61');
    expect(screen.getByText('‹ Prev')).toHaveAttribute('href', '/show/2');
    expect(screen.queryByText('More ›')).not.toBeInTheDocument();
  });

  it('shows the jobs header without the list margin', async () => {
    mockFetchFeed.mockResolvedValue(stories(5));
    const { container } = renderFeed('jobs', '/jobs/1');

    expect(await screen.findByText(/These are jobs at startups that were funded by Y Combinator/)).toHaveClass(
      'job-header'
    );
    expect(screen.getByRole('link', { name: 'Triplebyte' })).toHaveAttribute(
      'href',
      'https://triplebyte.com/?ref=yc_jobs'
    );
    expect(container.querySelector('ol')).not.toHaveClass('list-margin');
  });

  it('loads the next and previous pages from the pagination links', async () => {
    const user = userEvent.setup();
    mockFetchFeed.mockImplementation((_type, page) => Promise.resolve(stories(30, (page - 1) * 30 + 1)));
    const { container } = renderFeed('ask', '/ask/1');

    await user.click(await screen.findByText('More ›'));
    expect(screen.getByTestId('location')).toHaveTextContent('/ask/2');
    expect(await screen.findByText('Story 31')).toBeInTheDocument();
    expect(mockFetchFeed).toHaveBeenLastCalledWith('ask', 2, expect.any(AbortSignal));
    expect(container.querySelector('ol')).toHaveAttribute('start', '31');
    expect(screen.queryByText('Story 1')).not.toBeInTheDocument();

    await user.click(screen.getByText('‹ Prev'));
    expect(screen.getByTestId('location')).toHaveTextContent('/ask/1');
    expect(await screen.findByText('Story 1')).toBeInTheDocument();
    expect(window.scrollTo).toHaveBeenCalledTimes(3);
  });

  it('aborts the pending request on unmount', () => {
    mockFetchFeed.mockReturnValue(new Promise(() => {}));
    const { unmount } = renderFeed('news', '/news/1');
    const signal = mockFetchFeed.mock.calls[0][2]!;

    expect(signal.aborted).toBe(false);
    unmount();
    expect(signal.aborted).toBe(true);
  });

  it('ignores a request that rejects after it was aborted', async () => {
    let rejectFirst: (reason: unknown) => void = () => {};
    mockFetchFeed
      .mockReturnValueOnce(new Promise((_, reject) => (rejectFirst = reject)))
      .mockResolvedValueOnce(stories(3, 31));
    const { router } = renderFeed('news', '/news/1');

    await act(() => router.navigate('/news/2'));
    rejectFirst(new DOMException('Aborted', 'AbortError'));
    expect(await screen.findByText('Story 31')).toBeInTheDocument();
    expect(screen.queryByText(/Could not load/)).not.toBeInTheDocument();
  });
});
