import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import Item from './Item';
import { SettingsProvider } from '../../context/SettingsContext';
import type { Story } from '../../models/story';

const story = {
  id: 1,
  title: 'A linked story',
  points: 12,
  user: 'devin',
  time: 0,
  time_ago: '3 hours ago',
  type: 'story',
  url: 'https://example.com/story',
  domain: 'example.com',
  comments: [],
  comments_count: 1,
  poll: [],
  poll_votes_count: 0,
  deleted: false,
  dead: false,
} as Story;

function renderItem(item: Story) {
  return render(
    <SettingsProvider>
      <MemoryRouter>
        <Item item={item} />
      </MemoryRouter>
    </SettingsProvider>
  );
}

describe('Item', () => {
  it('links the title to the story url when it has one', () => {
    renderItem(story);

    expect(screen.getByRole('link', { name: 'A linked story' })).toHaveAttribute('href', 'https://example.com/story');
    expect(screen.getByText('(example.com)')).toBeInTheDocument();
    expect(screen.getAllByText(/1 comment/)).not.toHaveLength(0);
  });

  it('links the title to the item details page for self posts', () => {
    renderItem({ ...story, title: 'Ask HN', url: 'item?id=1', domain: '' });

    expect(screen.getByRole('link', { name: 'Ask HN' })).toHaveAttribute('href', '/item/1');
  });
});
