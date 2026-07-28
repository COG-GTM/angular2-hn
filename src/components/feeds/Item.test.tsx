import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { SettingsProvider } from '../../context/SettingsProvider';
import type { Story } from '../../types/story';
import { Item } from './Item';

function makeStory(overrides: Partial<Story> = {}): Story {
  return {
    id: 1,
    title: 'A great story',
    points: 42,
    user: 'alice',
    time: 0,
    time_ago: '3 hours ago',
    type: 'story',
    url: 'https://example.com/post',
    domain: 'example.com',
    comments: [],
    comments_count: 5,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
    ...overrides,
  } as unknown as Story;
}

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
  it('renders an external link with the domain for stories with an http url', () => {
    renderItem(makeStory());
    const title = screen.getByRole('link', { name: 'A great story' });
    expect(title).toHaveAttribute('href', 'https://example.com/post');
    expect(screen.getByText('(example.com)')).toBeInTheDocument();
  });

  it('omits target/rel when openLinkInNewTab is off', () => {
    renderItem(makeStory());
    const title = screen.getByRole('link', { name: 'A great story' });
    expect(title).not.toHaveAttribute('target');
    expect(title).not.toHaveAttribute('rel');
  });

  it('adds target=_blank rel=noopener when openLinkInNewTab is on', () => {
    localStorage.setItem('openLinkInNewTab', 'true');
    renderItem(makeStory());
    const title = screen.getByRole('link', { name: 'A great story' });
    expect(title).toHaveAttribute('target', '_blank');
    expect(title).toHaveAttribute('rel', 'noopener');
  });

  it('links internally to /item/:id when the url is not http', () => {
    renderItem(makeStory({ url: 'item?id=1', domain: '' }));
    const title = screen.getByRole('link', { name: 'A great story' });
    expect(title).toHaveAttribute('href', '/item/1');
  });

  it('shows points, user link and comment count for stories', () => {
    renderItem(makeStory());
    expect(screen.getAllByRole('link', { name: 'alice' })[0]).toHaveAttribute('href', '/user/alice');
    expect(screen.getAllByText(/42/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('5 comments').length).toBeGreaterThan(0);
  });

  it('hides points, user and comment links for job posts', () => {
    renderItem(makeStory({ type: 'job', user: 'hiring', comments_count: 0 }));
    expect(screen.queryByRole('link', { name: 'hiring' })).not.toBeInTheDocument();
    expect(screen.queryByText(/points by/)).not.toBeInTheDocument();
    expect(screen.getAllByText('3 hours ago').length).toBeGreaterThan(0);
  });

  it('renders "discuss" when a story has no comments', () => {
    renderItem(makeStory({ comments_count: 0 }));
    expect(screen.getAllByText('discuss').length).toBeGreaterThan(0);
  });

  it('applies titleFontSize and listSpacing from settings', () => {
    localStorage.setItem('titleFontSize', '20');
    localStorage.setItem('listSpacing', '8');
    const { container } = renderItem(makeStory());
    const title = screen.getByRole('link', { name: 'A great story' });
    expect(title).toHaveStyle({ fontSize: '20px' });
    expect(container.firstChild).toHaveStyle({ marginBottom: '8px' });
  });
});
