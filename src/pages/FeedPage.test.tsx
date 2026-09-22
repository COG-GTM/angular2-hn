import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeStory } from '../test/fixtures';
import { renderWithProviders } from '../test/render';
import { FeedPage } from './FeedPage';

const { fetchFeed } = vi.hoisted(() => ({ fetchFeed: vi.fn() }));

vi.mock('../services/hackerNewsApi', () => ({ fetchFeed }));

beforeEach(() => {
  fetchFeed.mockReset();
});

function renderFeed(page: string) {
  return renderWithProviders(<FeedPage feedType="news" />, { route: `/news/${page}`, path: '/news/:page' });
}

describe('FeedPage', () => {
  it('shows the loader and then the stories for the requested page', async () => {
    fetchFeed.mockResolvedValue([makeStory({ id: 1, title: 'First story' })]);
    renderFeed('1');

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(await screen.findByText('First story')).toBeInTheDocument();
    expect(fetchFeed).toHaveBeenCalledWith('news', 1, expect.any(AbortSignal));
  });

  it('numbers the list from the page offset and offers both pagination links', async () => {
    fetchFeed.mockResolvedValue(Array.from({ length: 30 }, (_, i) => makeStory({ id: i + 1, title: `Story ${i}` })));
    const { container } = renderFeed('2');

    await screen.findByText('Story 0');
    expect(container.querySelector('ol')).toHaveAttribute('start', '31');
    expect(screen.getByText('‹ Prev')).toHaveAttribute('href', '/news/1');
    expect(screen.getByText('More ›')).toHaveAttribute('href', '/news/3');
  });

  it('hides Prev on the first page and More on a short page', async () => {
    fetchFeed.mockResolvedValue([makeStory()]);
    renderFeed('1');

    await screen.findByText('A linked story');
    expect(screen.queryByText('‹ Prev')).not.toBeInTheDocument();
    expect(screen.queryByText('More ›')).not.toBeInTheDocument();
  });

  it('renders an error message when the feed request fails', async () => {
    fetchFeed.mockRejectedValue(new Error('boom'));
    renderFeed('1');

    await waitFor(() => expect(screen.getByText('Could not load news stories.')).toBeInTheDocument());
  });
});
