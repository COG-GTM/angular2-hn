import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Item from './Item';
import { SettingsProvider } from '../contexts/SettingsContext';
import { Story } from '../models/story';

const story: Story = {
  id: 1,
  title: 'A story title',
  points: 100,
  user: 'someuser',
  time: 0,
  time_ago: '2 hours ago',
  type: 'story',
  url: 'https://example.com/article',
  domain: 'example.com',
  content: '',
  comments: [],
  comments_count: 5,
  poll: [],
  poll_votes_count: 0,
  deleted: false,
  dead: false,
};

function renderItem(item: Story) {
  return render(
    <MemoryRouter>
      <SettingsProvider>
        <Item item={item} />
      </SettingsProvider>
    </MemoryRouter>
  );
}

describe('Item', () => {
  it('renders an external link when the story has a url', () => {
    renderItem(story);
    const link = screen.getByRole('link', { name: 'A story title' });
    expect(link).toHaveAttribute('href', 'https://example.com/article');
    expect(screen.getByText('(example.com)')).toBeInTheDocument();
  });

  it('links to the item page when the story has no url', () => {
    renderItem({ ...story, url: 'item?id=1', domain: '' });
    const link = screen.getByRole('link', { name: 'A story title' });
    expect(link).toHaveAttribute('href', '/item/1');
  });
});
