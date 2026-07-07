import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import Item from './Item';
import { Story } from '../models/story';
import { renderWithProviders } from '../test/test-utils';

function makeStory(overrides: Partial<Story> = {}): Story {
  return {
    id: 1,
    title: 'A great story',
    points: 42,
    user: 'alice',
    time: 0,
    time_ago: '2 hours ago',
    type: 'story',
    url: 'https://example.com/post',
    domain: 'example.com',
    content: '',
    text: '',
    comments: [],
    comments_count: 3,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
    ...overrides,
  };
}

describe('Item', () => {
  it('renders an external link with domain, user and comment count', () => {
    renderWithProviders(<Item item={makeStory()} />);

    const titleLinks = screen.getAllByRole('link', { name: 'A great story' });
    expect(titleLinks[0]).toHaveAttribute('href', 'https://example.com/post');
    expect(screen.getAllByText('(example.com)').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'alice' }).length).toBeGreaterThan(0);
    expect(screen.getAllByText('3 comments').length).toBeGreaterThan(0);
  });

  it('links internally to the item detail when there is no http url', () => {
    renderWithProviders(<Item item={makeStory({ url: 'item?id=1' })} />);

    const titleLinks = screen.getAllByRole('link', { name: 'A great story' });
    expect(titleLinks[0]).toHaveAttribute('href', '/item/1');
  });

  it('hides points, user and comments for job items', () => {
    renderWithProviders(<Item item={makeStory({ type: 'job', title: 'Hiring' })} />);

    expect(screen.queryByRole('link', { name: 'alice' })).toBeNull();
    expect(screen.queryByText('discuss')).toBeNull();
  });
});
