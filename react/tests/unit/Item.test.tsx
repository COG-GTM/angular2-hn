import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from './testUtils';
import { Item } from '../../src/components/feeds/Item';
import type { Story } from '../../src/models/story';

function makeStory(overrides: Partial<Story> = {}): Story {
  return {
    id: 1,
    title: 'A story title',
    points: 10,
    user: 'alice',
    time: 1,
    time_ago: 5 as unknown as number,
    type: 'story',
    url: 'http://example.com/a',
    domain: 'example.com',
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
  it('renders an external link title with the domain', () => {
    renderWithProviders(<Item item={makeStory()} />);
    const link = screen.getByText('A story title').closest('a')!;
    expect(link.getAttribute('href')).toBe('http://example.com/a');
    expect(screen.getByText('(example.com)')).toBeInTheDocument();
  });

  it('renders an internal /item link when the url is not http', () => {
    renderWithProviders(<Item item={makeStory({ url: 'item?id=1', domain: '' })} />);
    const link = screen.getByText('A story title').closest('a')!;
    expect(link.getAttribute('href')).toBe('/item/1');
  });

  it('renders comment count via the comment pipe', () => {
    renderWithProviders(<Item item={makeStory({ comments_count: 3 })} />);
    expect(screen.getAllByText(/3 comments/).length).toBeGreaterThan(0);
  });

  it('renders "discuss" when there are no comments', () => {
    renderWithProviders(<Item item={makeStory({ comments_count: 0 })} />);
    expect(screen.getAllByText('discuss').length).toBeGreaterThan(0);
  });

  it('hides points and user for job items', () => {
    renderWithProviders(<Item item={makeStory({ type: 'job' })} />);
    expect(screen.queryByText('alice')).toBeNull();
    expect(screen.queryByText(/★/)).toBeNull();
  });
});
