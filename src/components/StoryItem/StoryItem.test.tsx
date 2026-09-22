import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { makeStory } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { StoryItem } from './StoryItem';

describe('StoryItem', () => {
  it('links externally hosted stories to their source', () => {
    renderWithProviders(<StoryItem item={makeStory()} />);

    const title = screen.getByRole('link', { name: 'A linked story' });
    expect(title).toHaveAttribute('href', 'https://example.com/post');
    expect(screen.getByText('(example.com)')).toBeInTheDocument();
  });

  it('links self-hosted stories to the item page', () => {
    renderWithProviders(<StoryItem item={makeStory({ id: 9, url: 'item?id=9', title: 'Ask HN' })} />);

    expect(screen.getByRole('link', { name: 'Ask HN' })).toHaveAttribute('href', '/item/9');
  });

  it('omits points and comments for job posts', () => {
    renderWithProviders(<StoryItem item={makeStory({ type: 'job', title: 'We are hiring' })} />);

    expect(screen.queryByText(/points by/)).not.toBeInTheDocument();
    expect(screen.queryByText(/comments/)).not.toBeInTheDocument();
  });

  it('shows a comment count link for discussion posts', () => {
    renderWithProviders(<StoryItem item={makeStory({ comments_count: 3 })} />);

    expect(screen.getAllByRole('link', { name: '3 comments' })[0]).toHaveAttribute('href', '/item/1');
  });
});
