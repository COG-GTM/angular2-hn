import { screen } from '@testing-library/react';

import type { Settings, Story } from '../../models';
import { makeStory } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { FeedItem } from './FeedItem';

function renderItem(item: Story, settings?: Partial<Settings>) {
  return renderWithProviders(<FeedItem item={item} />, { settings });
}

describe('FeedItem', () => {
  it('links the title to the external url and shows the domain', () => {
    const { container } = renderItem(makeStory({ id: 5, title: 'Hello', url: 'https://example.com/a' }));
    const title = screen.getByRole('link', { name: 'Hello' });
    expect(title).toHaveAttribute('href', 'https://example.com/a');
    expect(title).toHaveClass('title');
    expect(title).not.toHaveAttribute('target');
    expect(title).not.toHaveAttribute('rel');
    expect(container.querySelector('.domain')).toHaveTextContent('(example.com)');
  });

  it('omits the domain when the story has none', () => {
    const { container } = renderItem(makeStory({ domain: undefined }));
    expect(container.querySelector('.domain')).not.toBeInTheDocument();
  });

  it('opens external links in a new tab when the setting is on', () => {
    renderItem(makeStory({ title: 'Hello' }), { openLinkInNewTab: true });
    const title = screen.getByRole('link', { name: 'Hello' });
    expect(title).toHaveAttribute('target', '_blank');
    expect(title).toHaveAttribute('rel', 'noopener');
  });

  it('links self posts (Ask/Show HN) to the item page', () => {
    const { container } = renderItem(
      makeStory({ id: 9, title: 'Ask HN: Anything?', url: 'item?id=9', domain: undefined }),
      { openLinkInNewTab: true }
    );
    const title = screen.getByRole('link', { name: 'Ask HN: Anything?' });
    expect(title).toHaveAttribute('href', '/item/9');
    expect(title).not.toHaveAttribute('target');
    expect(container.querySelector('.domain')).not.toBeInTheDocument();
  });

  it('shows points, author and comment links in both layouts', () => {
    const { container } = renderItem(makeStory({ id: 3, user: 'alice', points: 42, comments_count: 1 }));
    const laptop = container.querySelector('.subtext-laptop')!;
    const palm = container.querySelector('.subtext-palm')!;

    expect(laptop).toHaveTextContent('42 points by alice');
    expect(laptop).toHaveTextContent('2 hours ago | 1 comment');
    expect(laptop.querySelector('a[href="/user/alice"]')).toBeInTheDocument();
    expect(laptop.querySelector('a[href="/item/3"]')).toHaveTextContent('1 comment');
    expect(laptop.querySelector('.item-details')).toBeInTheDocument();

    expect(palm.querySelector('.name a')).toHaveAttribute('href', '/user/alice');
    expect(palm.querySelector('.right')).toHaveTextContent('42 ★');
    expect(palm.querySelector('a.comment-number')).toHaveAttribute('href', '/item/3');
    expect(palm.querySelector('a.comment-number')).toHaveTextContent('• 1 comment');
  });

  it.each([
    [0, 'discuss'],
    [12, '12 comments'],
  ])('formats %i comments as "%s"', (count, text) => {
    const { container } = renderItem(makeStory({ comments_count: count }));
    expect(container.querySelector('.subtext-laptop a[href="/item/1"]')).toHaveTextContent(text);
  });

  it('hides points, author and comments for jobs', () => {
    const { container } = renderItem(
      makeStory({ id: 4, type: 'job', title: 'Acme is hiring', user: '', points: 0, time_ago: '3 hours ago' })
    );
    expect(container.querySelector('.subtext-laptop')).toHaveTextContent(/^3 hours ago$/);
    expect(container.querySelector('.subtext-laptop .item-details')).not.toBeInTheDocument();
    expect(container.querySelectorAll('.subtext-palm .details')).toHaveLength(1);
    expect(container.querySelector('a[href^="/user/"]')).not.toBeInTheDocument();
    expect(container.querySelector('a[href="/item/4"]')).not.toBeInTheDocument();
    expect(screen.queryByText(/★/)).not.toBeInTheDocument();
  });

  it('applies the title font size and list spacing settings', () => {
    const { container } = renderItem(makeStory({ title: 'Hello' }), { titleFontSize: '20', listSpacing: '15' });
    expect(screen.getByRole('link', { name: 'Hello' })).toHaveStyle({ fontSize: '20px' });
    expect(container.querySelector('.item-block > div')).toHaveStyle({ marginBottom: '15px' });
  });
});
