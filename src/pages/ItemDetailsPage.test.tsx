import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeComment, makeStory } from '../test/fixtures';
import { renderWithProviders } from '../test/render';
import { ItemDetailsPage } from './ItemDetailsPage';

const { fetchItemContent } = vi.hoisted(() => ({ fetchItemContent: vi.fn() }));

vi.mock('../services/hackerNewsApi', () => ({ fetchItemContent }));

beforeEach(() => {
  fetchItemContent.mockReset();
});

function renderItem(id = '1') {
  return renderWithProviders(<ItemDetailsPage />, { route: `/item/${id}`, path: '/item/:id' });
}

describe('ItemDetailsPage', () => {
  it('renders the story, its text and its comment tree', async () => {
    fetchItemContent.mockResolvedValue(
      makeStory({ content: '<p>Story body</p>', comments: [makeComment({ content: '<p>Nice</p>' })] })
    );
    renderItem();

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(await screen.findByText('Story body')).toBeInTheDocument();
    expect(screen.getByText('Nice')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'A linked story' })[0]).toHaveAttribute(
      'href',
      'https://example.com/post'
    );
    expect(fetchItemContent).toHaveBeenCalledWith(1, expect.any(AbortSignal));
  });

  it('renders poll options with bars proportional to their share of the votes', async () => {
    fetchItemContent.mockResolvedValue(
      makeStory({
        type: 'poll',
        poll: [
          { points: 30, content: 'Option A' },
          { points: 10, content: 'Option B' },
        ],
        poll_votes_count: 40,
      })
    );
    const { container } = renderItem();

    expect(await screen.findByText('Option A')).toBeInTheDocument();
    const bars = container.querySelectorAll<HTMLElement>('.pollBar');
    expect(bars[0].style.width).toBe('75%');
    expect(bars[1].style.width).toBe('25%');
  });

  it('renders an error message when the item cannot be loaded', async () => {
    fetchItemContent.mockRejectedValue(new Error('boom'));
    renderItem();

    expect(await screen.findByText('Could not load story.')).toBeInTheDocument();
  });
});
