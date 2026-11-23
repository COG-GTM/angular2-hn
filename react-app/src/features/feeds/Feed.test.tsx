import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fetchFeed } from '../../api/hn';
import type { FeedType } from '../../api/types';
import { Feed } from './Feed';
import { renderRoutes, story } from './testUtils';

vi.mock('../../api/hn', () => ({ fetchFeed: vi.fn() }));
const mockFetchFeed = vi.mocked(fetchFeed);

const page = (n: number, count = 30) =>
  Array.from({ length: count }, (_, i) => story({ id: n * 100 + i, title: `Story ${n}-${i}` }));

function renderFeed(feedType: FeedType, path: string) {
  return renderRoutes([{ path: `/${feedType}/:page`, element: <Feed key={feedType} feedType={feedType} /> }], path);
}

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  mockFetchFeed.mockImplementation((_feed, n) => Promise.resolve(page(n)));
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Feed', () => {
  it('shows the loader, then the list, and scrolls to top', async () => {
    const { container } = renderFeed('news', '/news/1');
    expect(container.querySelector('.loader')).not.toBeNull();
    await screen.findByText('Story 1-0');
    expect(mockFetchFeed).toHaveBeenCalledWith('news', 1, expect.any(AbortSignal));
    expect(container.querySelectorAll('li.post')).toHaveLength(30);
    expect(container.querySelector('ol')).toHaveAttribute('start', '1');
    expect(container.querySelector('ol')).toHaveClass('list-margin');
    expect(container.querySelector('.job-header')).toBeNull();
    expect(container.querySelector('.nav .prev')).toBeNull();
    expect(container.querySelector('.nav .more')).toHaveAttribute('href', '/news/2');
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('pages with More and Prev', async () => {
    const { container } = renderFeed('news', '/news/1');
    await screen.findByText('Story 1-0');
    await userEvent.click(container.querySelector('.nav .more')!);
    await screen.findByText('Story 2-0');
    expect(container.querySelector('ol')).toHaveAttribute('start', '31');
    expect(container.querySelector('.nav .prev')).toHaveAttribute('href', '/news/1');
    await userEvent.click(container.querySelector('.nav .prev')!);
    await screen.findByText('Story 1-0');
    expect(container.querySelector('ol')).toHaveAttribute('start', '1');
  });

  it('hides More when the page has fewer than 30 items', async () => {
    mockFetchFeed.mockResolvedValue(page(3, 12));
    const { container } = renderFeed('show', '/show/3');
    await screen.findByText('Story 3-0');
    expect(container.querySelector('ol')).toHaveAttribute('start', '61');
    expect(container.querySelector('.nav .more')).toBeNull();
    expect(container.querySelector('.nav .prev')).toHaveAttribute('href', '/show/2');
  });

  it('shows the jobs header without the list margin', async () => {
    mockFetchFeed.mockResolvedValue(page(1, 5).map((s) => ({ ...s, type: 'job' as const })));
    const { container } = renderFeed('jobs', '/jobs/1');
    await screen.findByText('Story 1-0');
    expect(container.querySelector('.job-header')).toHaveTextContent('These are jobs at startups that were funded by Y Combinator.');
    expect(container.querySelector('ol')).not.toHaveClass('list-margin');
  });

  it('shows the error message when the feed fails to load', async () => {
    mockFetchFeed.mockRejectedValue(new Error('500'));
    const { container } = renderFeed('ask', '/ask/1');
    await waitFor(() => expect(container.querySelector('.error-section .strong')).toHaveTextContent('Could not load ask stories.'));
    expect(container.querySelector('.loader')).toBeNull();
    await act(async () => {});
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
