import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';

import Feed from './Feed';
import { Story } from '../models/story';
import { renderWithProviders } from '../test/test-utils';
import * as hnApi from '../api/hnApi';

vi.mock('../api/hnApi');

function makeStory(id: number, overrides: Partial<Story> = {}): Story {
  return {
    id,
    title: `Story ${id}`,
    points: 10,
    user: 'alice',
    time: 0,
    time_ago: '1 hour ago',
    type: 'story',
    url: `https://example.com/${id}`,
    domain: 'example.com',
    content: '',
    text: '',
    comments: [],
    comments_count: 1,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
    ...overrides,
  };
}

describe('Feed', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders a loader then the list of items', async () => {
    vi.mocked(hnApi.fetchFeed).mockResolvedValue([makeStory(1), makeStory(2)]);
    renderWithProviders(<Feed feedType="news" />, { route: '/news/1', path: '/news/:page' });

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('Story 1')).toBeInTheDocument());
    expect(screen.getByText('Story 2')).toBeInTheDocument();
    expect(hnApi.fetchFeed).toHaveBeenCalledWith('news', 1);
  });

  it('shows the "More" link but no "Prev" link on a full first page', async () => {
    vi.mocked(hnApi.fetchFeed).mockResolvedValue(
      Array.from({ length: 30 }, (_, i) => makeStory(i + 1))
    );
    renderWithProviders(<Feed feedType="news" />, { route: '/news/1', path: '/news/:page' });

    await waitFor(() => expect(screen.getByText(/More/)).toBeInTheDocument());
    expect(screen.getByText(/More/).closest('a')).toHaveAttribute('href', '/news/2');
    expect(screen.queryByText(/Prev/)).toBeNull();
  });

  it('shows the job header for the jobs feed', async () => {
    vi.mocked(hnApi.fetchFeed).mockResolvedValue([makeStory(1, { type: 'job' })]);
    renderWithProviders(<Feed feedType="jobs" />, { route: '/jobs/1', path: '/jobs/:page' });

    await waitFor(() =>
      expect(screen.getByText(/jobs at startups that were funded by Y Combinator/)).toBeInTheDocument()
    );
  });

  it('renders an error message when the fetch fails', async () => {
    vi.mocked(hnApi.fetchFeed).mockRejectedValue(new Error('boom'));
    renderWithProviders(<Feed feedType="news" />, { route: '/news/1', path: '/news/:page' });

    await waitFor(() =>
      expect(screen.getByText('Could not load news stories.')).toBeInTheDocument()
    );
  });
});
