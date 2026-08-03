import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeComment, makeStory } from '../../test/fixtures';
import { renderWithProviders } from '../../test/renderWithProviders';
import { fetchItemContent } from '../shared/services/hackernewsApi';
import { ItemDetails } from './ItemDetails';

vi.mock('../shared/services/hackernewsApi');

const fetchItemContentMock = vi.mocked(fetchItemContent);

function renderItem(id = 1) {
  return renderWithProviders(<ItemDetails />, { route: `/item/${id}`, path: '/item/:id' });
}

beforeEach(() => {
  fetchItemContentMock.mockReset();
});

describe('ItemDetails', () => {
  it('shows the loader until the item arrives', async () => {
    fetchItemContentMock.mockResolvedValue(makeStory());
    renderItem();

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Loading...')).toBeNull());
  });

  it('requests the item id from the route', async () => {
    fetchItemContentMock.mockResolvedValue(makeStory({ id: 8863 }));
    renderItem(8863);

    await waitFor(() => expect(fetchItemContentMock).toHaveBeenCalledWith(8863, expect.any(AbortSignal)));
  });

  it('renders the story header and body', async () => {
    fetchItemContentMock.mockResolvedValue(
      makeStory({ id: 5, content: '<p>Story body</p>', comments_count: 1, comments: [makeComment()] })
    );
    renderItem(5);

    expect(await screen.findByText('Story body')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'A React story' })[0]).toHaveAttribute(
      'href',
      'https://react.dev/blog'
    );
    expect(screen.getByRole('link', { name: '1 comment' })).toHaveAttribute('href', '/item/5');
    expect(screen.getByText('Nice write-up')).toBeInTheDocument();
  });

  it('opens the story link in a new tab when configured', async () => {
    localStorage.setItem('openLinkInNewTab', 'true');
    fetchItemContentMock.mockResolvedValue(makeStory());
    renderItem();

    const links = await screen.findAllByRole('link', { name: 'A React story' });
    expect(links[0]).toHaveAttribute('target', '_blank');
    expect(links[0]).toHaveAttribute('rel', 'noopener');
  });

  it('renders poll results as proportional bars', async () => {
    fetchItemContentMock.mockResolvedValue(
      makeStory({
        type: 'poll',
        url: '',
        poll: [
          { points: 25, content: 'option a' },
          { points: 75, content: 'option b' },
        ],
        poll_votes_count: 100,
      })
    );
    const { container } = renderItem();

    expect(await screen.findByText('option a')).toBeInTheDocument();
    expect(screen.getByText('25 points')).toBeInTheDocument();

    const bars = container.querySelectorAll('.pollBar');
    expect(bars[0]).toHaveStyle({ width: '25%' });
    expect(bars[1]).toHaveStyle({ width: '75%' });
  });

  it('hides points and comments for jobs', async () => {
    fetchItemContentMock.mockResolvedValue(makeStory({ type: 'job', user: 'dan', comments_count: 0 }));
    renderItem();

    await screen.findAllByRole('link', { name: 'A React story' });
    expect(screen.queryByRole('link', { name: 'dan' })).toBeNull();
    expect(screen.queryByRole('link', { name: /discuss/ })).toBeNull();
  });

  it('shows an error message when the item cannot be loaded', async () => {
    fetchItemContentMock.mockRejectedValue(new Error('offline'));
    renderItem();

    expect(await screen.findByText('Could not load item comments.')).toBeInTheDocument();
  });
});
