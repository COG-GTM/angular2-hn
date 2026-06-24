import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Item } from './Item';
import { SettingsProvider } from '../../context/SettingsProvider';
import { Story } from '../../models/story';

const baseStory: Story = {
  id: 1,
  title: 'A great story',
  points: 123,
  user: 'pg',
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

function renderItem(story: Story) {
  return render(
    <MemoryRouter>
      <SettingsProvider>
        <Item item={story} />
      </SettingsProvider>
    </MemoryRouter>,
  );
}

describe('Item', () => {
  it('renders an external link with the domain for stories with a url', () => {
    renderItem(baseStory);
    const titleLink = screen.getByRole('link', { name: 'A great story' });
    expect(titleLink).toHaveAttribute('href', 'https://example.com/article');
    expect(screen.getByText('(example.com)')).toBeInTheDocument();
    expect(screen.getAllByText(/5 comments/).length).toBeGreaterThan(0);
  });

  it('links to the item details page when the story has no external url', () => {
    renderItem({ ...baseStory, url: '', domain: '' });
    const titleLink = screen.getByRole('link', { name: 'A great story' });
    expect(titleLink).toHaveAttribute('href', '/item/1');
  });
});
