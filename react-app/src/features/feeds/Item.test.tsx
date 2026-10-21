import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { Story } from '../../models';
import { renderWithProviders } from '../../test/renderWithProviders';
import Item from './Item';

function story(overrides: Partial<Story> = {}): Story {
  return {
    id: 42,
    title: 'A story',
    points: 120,
    user: 'pg',
    time: 0,
    time_ago: '3 hours ago',
    type: 'link',
    url: 'https://example.com/post',
    domain: 'example.com',
    comments: [],
    comments_count: 7,
    ...overrides,
  };
}

const renderItem = (item: Story) =>
  renderWithProviders(<Item item={item} />, { route: '/news/1', path: '/news/:page' });

describe('Item', () => {
  it('renders an external story with domain, points, user and comment links', () => {
    const { container } = renderItem(story());

    const title = screen.getByRole('link', { name: 'A story' });
    expect(title).toHaveAttribute('href', 'https://example.com/post');
    expect(title).toHaveClass('title');
    expect(title).not.toHaveAttribute('target');
    expect(title).not.toHaveAttribute('rel');
    expect(screen.getByText('(example.com)')).toHaveClass('domain');

    const laptop = container.querySelector('.subtext-laptop')!;
    expect(laptop).toHaveTextContent('120 points by pg 3 hours ago | 7 comments');
    expect(laptop.querySelector('a[href="/user/pg"]')).toBeInTheDocument();
    expect(laptop.querySelector('a[href="/item/42"]')).toHaveTextContent('7 comments');
    expect(laptop.querySelector('.item-details')).toBeInTheDocument();

    const palm = container.querySelector('.subtext-palm')!;
    expect(palm.querySelector('.right')).toHaveTextContent('120 ★');
    expect(palm.querySelector('.comment-number')).toHaveTextContent('• 7 comments');
    expect(palm.querySelector('.comment-number')).toHaveAttribute('href', '/item/42');
  });

  it('links self posts to the item page and omits the domain', () => {
    const { container } = renderItem(story({ type: 'ask', url: 'item?id=42', domain: undefined, comments_count: 0 }));

    expect(screen.getByRole('link', { name: 'A story' })).toHaveAttribute('href', '/item/42');
    expect(container.querySelector('.domain')).not.toBeInTheDocument();
    expect(container.querySelector('.subtext-laptop')).toHaveTextContent('discuss');
  });

  it('formats a single comment', () => {
    const { container } = renderItem(story({ comments_count: 1 }));
    expect(container.querySelector('.comment-number')).toHaveTextContent('• 1 comment');
  });

  it('hides points, user and comments for jobs', () => {
    const { container } = renderItem(story({ type: 'job', points: null, user: null }));

    expect(container.querySelector('.subtext-laptop')).toHaveTextContent(/^3 hours ago$/);
    expect(container.querySelector('.subtext-palm')).toHaveTextContent(/^3 hours ago$/);
    expect(container.querySelector('.item-details')).not.toBeInTheDocument();
    expect(container.querySelector('a[href^="/user/"]')).not.toBeInTheDocument();
    expect(container.querySelector('a[href="/item/42"]')).not.toBeInTheDocument();
  });

  it('applies the font size, list spacing and new-tab settings', () => {
    localStorage.setItem('titleFontSize', '20');
    localStorage.setItem('listSpacing', '15');
    localStorage.setItem('openLinkInNewTab', 'true');
    const { container } = renderItem(story());

    const title = screen.getByRole('link', { name: 'A story' });
    expect(title).toHaveStyle({ fontSize: '20px' });
    expect(title).toHaveAttribute('target', '_blank');
    expect(title).toHaveAttribute('rel', 'noopener');
    expect(container.querySelector('.item-block > div')).toHaveStyle({ marginBottom: '15px' });
  });

  it('applies the font size to internal titles but never opens them in a new tab', () => {
    localStorage.setItem('titleFontSize', '18');
    localStorage.setItem('openLinkInNewTab', 'true');
    renderItem(story({ url: 'item?id=42' }));

    const title = screen.getByRole('link', { name: 'A story' });
    expect(title).toHaveStyle({ fontSize: '18px' });
    expect(title).not.toHaveAttribute('target');
  });

  it('navigates to the user and item pages', async () => {
    const user = userEvent.setup();
    const { container } = renderItem(story());

    await user.click(container.querySelector('.subtext-laptop a[href="/user/pg"]')!);
    expect(screen.getByTestId('location')).toHaveTextContent('/user/pg');
  });

  it('navigates to the item page from the comments link', async () => {
    const user = userEvent.setup();
    const { container } = renderItem(story());

    await user.click(container.querySelector('.comment-number')!);
    expect(screen.getByTestId('location')).toHaveTextContent('/item/42');
  });
});
