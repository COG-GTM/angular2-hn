import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { SettingsProvider } from '../../context/SettingsContext';
import type { Story } from '../../models';
import Item from './Item';

function renderItem(overrides: Partial<Story> = {}) {
  const item = {
    id: 1,
    title: 'A story',
    points: 10,
    user: 'pg',
    time: 0,
    time_ago: '1 hour ago',
    type: 'story',
    url: 'item?id=1',
    domain: '',
    comments: [],
    comments_count: 3,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
    ...overrides,
  } as unknown as Story;

  return render(
    <SettingsProvider>
      <MemoryRouter>
        <Item item={item} />
      </MemoryRouter>
    </SettingsProvider>
  );
}

describe('Item', () => {
  it('links internally when the story has no external url', () => {
    renderItem();
    expect(screen.getByRole('link', { name: 'A story' })).toHaveAttribute('href', '/item/1');
  });

  it('links externally with domain when the story has a url', () => {
    renderItem({ url: 'https://example.com/x', domain: 'example.com' });
    expect(screen.getByRole('link', { name: 'A story' })).toHaveAttribute(
      'href',
      'https://example.com/x'
    );
    expect(screen.getByText('(example.com)')).toBeInTheDocument();
  });

  it('shows the comment count text', () => {
    renderItem();
    expect(screen.getAllByText(/3 comments/).length).toBeGreaterThan(0);
  });
});
