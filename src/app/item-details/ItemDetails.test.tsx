import { screen } from '@testing-library/react';

import { makeComment, makeStory } from '../../test/fixtures';
import { mockFetch, renderWithProviders } from '../../test/utils';
import { API_BASE_URL } from '../shared/services/hackernewsApi';
import { ItemDetails } from './ItemDetails';

function renderItem(id: number) {
  return renderWithProviders(<ItemDetails />, { route: `/item/${id}`, path: '/item/:id' });
}

describe('ItemDetails', () => {
  it('renders the story, its text and comment tree', async () => {
    mockFetch({
      [`${API_BASE_URL}/item/1`]: makeStory({
        content: '<p>Story body</p>',
        comments_count: 2,
        comments: [makeComment({ comments: [makeComment({ id: 101, content: 'Reply' })] })],
      }),
    });
    renderItem(1);

    expect(await screen.findByText('Story body')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'A story' })[0]).toHaveAttribute('href', 'https://example.com/story');
    expect(screen.getByText(/42 points by/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '2 comments' })).toHaveAttribute('href', '/item/1');
    expect(screen.getByText('Top level comment')).toBeInTheDocument();
    expect(screen.getByText('Reply')).toBeInTheDocument();
  });

  it('renders poll results with proportional bars', async () => {
    mockFetch({
      [`${API_BASE_URL}/item/10`]: makeStory({
        id: 10,
        type: 'poll',
        url: 'item?id=10',
        poll: [
          { points: 0, content: '' },
          { points: 0, content: '' },
        ],
      }),
      [`${API_BASE_URL}/item/11`]: { points: 75, content: 'Yes' },
      [`${API_BASE_URL}/item/12`]: { points: 25, content: 'No' },
    });
    const { container } = renderItem(10);

    expect(await screen.findByText('75 points')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
    const bars = container.querySelectorAll<HTMLElement>('.pollBar');
    expect(bars[0]).toHaveStyle({ width: '75%' });
    expect(bars[1]).toHaveStyle({ width: '25%' });
  });

  it('shows an error when the item cannot be loaded', async () => {
    mockFetch({});
    renderItem(99);
    expect(await screen.findByText('Could not load item comments.')).toBeInTheDocument();
  });
});
