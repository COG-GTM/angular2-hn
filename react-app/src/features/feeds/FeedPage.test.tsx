import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { fetchFeed } from '../../api/hackernews';
import type { FeedType } from '../../models';
import { renderWithProviders } from '../../test/renderWithProviders';
import FeedPage from './FeedPage';
import { testStory } from './testStory';

vi.mock('../../api/hackernews');

const mockFetchFeed = vi.mocked(fetchFeed);

const stories = (count: number, firstId = 1) => Array.from({ length: count }, (_, i) => testStory({ id: firstId + i }));

function renderFeed(feedType: FeedType, route: string) {
  return renderWithProviders(<FeedPage feedType={feedType} />, { route, path: `/${feedType}/:page` });
}

describe('FeedPage', () => {
  beforeEach(() => {
    mockFetchFeed.mockReset();
    vi.mocked(window.scrollTo).mockClear();
  });

  it('shows the loader while the feed loads, falling back to page 1 for invalid pages', () => {
    mockFetchFeed.mockReturnValue(new Promise(() => {}));
    const { container } = renderFeed('news', '/news/-1');

    expect(container.querySelector('.main-content .loading-section')).toBeInTheDocument();
    expect(mockFetchFeed).toHaveBeenCalledWith('news', 1, expect.any(AbortSignal));
  });

  it('shows an error message when the feed fails', async () => {
    mockFetchFeed.mockRejectedValue(new Error('boom'));
    renderFeed('newest', '/newest/1');

    expect(await screen.findByText('Could not load newest stories.')).toHaveClass('error-section');
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
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('numbers later pages, hides More on a short page and shows the jobs header', async () => {
    mockFetchFeed.mockResolvedValue(stories(12, 61));
    const { container } = renderFeed('jobs', '/jobs/3');

    expect(await screen.findByText(/jobs at startups that were funded by Y Combinator/)).toHaveClass('job-header');
    expect(screen.getByRole('link', { name: 'Triplebyte' })).toHaveAttribute(
      'href',
      'https://triplebyte.com/?ref=yc_jobs'
    );
    expect(mockFetchFeed).toHaveBeenCalledWith('jobs', 3, expect.any(AbortSignal));
    expect(container.querySelector('ol')).toHaveAttribute('start', '61');
    expect(container.querySelector('ol')).not.toHaveClass('list-margin');
    expect(screen.getByText('‹ Prev')).toHaveAttribute('href', '/jobs/2');
    expect(screen.queryByText('More ›')).not.toBeInTheDocument();
  });

  it('loads the next and previous pages from the pagination links', async () => {
    const user = userEvent.setup();
    mockFetchFeed.mockImplementation((_type, page) => Promise.resolve(stories(30, (page - 1) * 30 + 1)));
    renderFeed('ask', '/ask/1');

    await user.click(await screen.findByText('More ›'));
    expect(screen.getByTestId('location')).toHaveTextContent('/ask/2');
    expect(await screen.findByText('Story 31')).toBeInTheDocument();
    expect(mockFetchFeed).toHaveBeenLastCalledWith('ask', 2, expect.any(AbortSignal));

    await user.click(screen.getByText('‹ Prev'));
    expect(await screen.findByText('Story 1')).toBeInTheDocument();
    expect(window.scrollTo).toHaveBeenCalledTimes(3);
  });

  it('aborts on page change, ignores the aborted rejection and never shows stale results', async () => {
    let rejectFirst: (reason: unknown) => void = () => {};
    mockFetchFeed
      .mockReturnValueOnce(new Promise((_, reject) => (rejectFirst = reject)))
      .mockResolvedValueOnce(stories(3, 31));
    const { router } = renderFeed('news', '/news/1');
    const signal = mockFetchFeed.mock.calls[0][2]!;

    await act(() => router.navigate('/news/2'));
    expect(signal.aborted).toBe(true);
    rejectFirst(new DOMException('Aborted', 'AbortError'));
    expect(await screen.findByText('Story 31')).toBeInTheDocument();
    expect(screen.queryByText(/Could not load/)).not.toBeInTheDocument();

    mockFetchFeed.mockReturnValueOnce(new Promise(() => {}));
    await act(() => router.navigate('/news/1'));
    expect(screen.queryByText('Story 31')).not.toBeInTheDocument();
    expect(document.querySelector('.loading-section')).toBeInTheDocument();
  });
});
