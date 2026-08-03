import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeStories, makeStory } from '../../../test/fixtures';
import { renderWithProviders } from '../../../test/renderWithProviders';
import { fetchFeed } from '../../shared/services/hackernewsApi';
import { Feed } from './Feed';

vi.mock('../../shared/services/hackernewsApi');

const fetchFeedMock = vi.mocked(fetchFeed);

function renderFeed(feedType = 'news', page = 1) {
  return renderWithProviders(<Feed feedType={feedType} />, {
    route: `/${feedType}/${page}`,
    path: `/${feedType}/:page`,
  });
}

beforeEach(() => {
  fetchFeedMock.mockReset();
});

describe('Feed', () => {
  it('shows the loader until the stories arrive', async () => {
    fetchFeedMock.mockResolvedValue([makeStory()]);
    renderFeed();

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'A React story' })).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).toBeNull();
  });

  it('requests the feed type and page from the route', async () => {
    fetchFeedMock.mockResolvedValue([]);
    renderFeed('show', 3);

    await waitFor(() => expect(fetchFeedMock).toHaveBeenCalledWith('show', 3, expect.any(AbortSignal)));
  });

  it('numbers the list from the current page offset', async () => {
    fetchFeedMock.mockResolvedValue(makeStories(30));
    const { container } = renderFeed('news', 3);

    await screen.findByRole('link', { name: 'Story 1' });
    expect(container.querySelector('ol')).toHaveAttribute('start', '61');
  });

  it('scrolls back to the top once a page is loaded', async () => {
    fetchFeedMock.mockResolvedValue([makeStory()]);
    renderFeed();

    await waitFor(() => expect(window.scrollTo).toHaveBeenCalledWith(0, 0));
  });

  it('offers a More link only when the page is full', async () => {
    fetchFeedMock.mockResolvedValue(makeStories(30));
    renderFeed('news', 1);

    expect(await screen.findByRole('link', { name: 'More ›' })).toHaveAttribute('href', '/news/2');
    expect(screen.queryByRole('link', { name: '‹ Prev' })).toBeNull();
  });

  it('offers a Prev link beyond the first page', async () => {
    fetchFeedMock.mockResolvedValue(makeStories(10));
    renderFeed('news', 4);

    expect(await screen.findByRole('link', { name: '‹ Prev' })).toHaveAttribute('href', '/news/3');
    expect(screen.queryByRole('link', { name: 'More ›' })).toBeNull();
  });

  it('explains the jobs feed and drops the list numbering margin', async () => {
    fetchFeedMock.mockResolvedValue([makeStory({ type: 'job' })]);
    const { container } = renderFeed('jobs', 1);

    expect(await screen.findByText(/funded by Y Combinator/)).toBeInTheDocument();
    expect(container.querySelector('ol')).not.toHaveClass('list-margin');
  });

  it('shows an error message when the feed cannot be loaded', async () => {
    fetchFeedMock.mockRejectedValue(new Error('offline'));
    renderFeed('ask', 1);

    expect(await screen.findByText('Could not load ask stories.')).toBeInTheDocument();
  });
});
