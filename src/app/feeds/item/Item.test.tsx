import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { makeStory } from '../../../test/fixtures';
import { renderWithProviders } from '../../../test/renderWithProviders';
import { Item } from './Item';

describe('Item', () => {
  it('links a story with a url to its source and shows the domain', () => {
    renderWithProviders(<Item item={makeStory()} />);

    const title = screen.getByRole('link', { name: 'A React story' });
    expect(title).toHaveAttribute('href', 'https://react.dev/blog');
    expect(title).not.toHaveAttribute('target');
    expect(screen.getByText('(react.dev)')).toBeInTheDocument();
  });

  it('links a story without a url to its discussion', () => {
    renderWithProviders(<Item item={makeStory({ id: 9, url: 'item?id=9', domain: undefined })} />);

    expect(screen.getByRole('link', { name: 'A React story' })).toHaveAttribute('href', '/item/9');
  });

  it('opens external links in a new tab when configured', () => {
    localStorage.setItem('openLinkInNewTab', 'true');
    renderWithProviders(<Item item={makeStory()} />);

    const title = screen.getByRole('link', { name: 'A React story' });
    expect(title).toHaveAttribute('target', '_blank');
    expect(title).toHaveAttribute('rel', 'noopener');
  });

  it('shows points, author and comment count for a story', () => {
    renderWithProviders(<Item item={makeStory({ id: 3, user: 'dan', points: 42, comments_count: 3 })} />);

    expect(screen.getAllByRole('link', { name: 'dan' })[0]).toHaveAttribute('href', '/user/dan');
    expect(screen.getAllByRole('link', { name: /3 comments/ })[0]).toHaveAttribute('href', '/item/3');
    expect(screen.getAllByText(/42/)[0]).toBeInTheDocument();
  });

  it('invites discussion when a story has no comments', () => {
    renderWithProviders(<Item item={makeStory({ comments_count: 0 })} />);

    expect(screen.getAllByRole('link', { name: /discuss/ })).toHaveLength(2);
  });

  it('hides points, author and comments for jobs', () => {
    renderWithProviders(<Item item={makeStory({ type: 'job', user: 'dan', comments_count: 0 })} />);

    expect(screen.queryByRole('link', { name: 'dan' })).toBeNull();
    expect(screen.queryByRole('link', { name: /discuss/ })).toBeNull();
    expect(screen.getAllByText('2 hours ago')).toHaveLength(2);
  });

  it('applies the configured title font size and list spacing', () => {
    localStorage.setItem('titleFontSize', '22');
    localStorage.setItem('listSpacing', '6');
    const { container } = renderWithProviders(<Item item={makeStory()} />);

    expect(container.querySelector('.item-view')).toHaveStyle({ marginBottom: '6px' });
    expect(screen.getByRole('link', { name: 'A React story' })).toHaveStyle({ fontSize: '22px' });
  });
});
