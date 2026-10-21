import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { Story } from '../../models';
import { renderWithProviders } from '../../test/renderWithProviders';
import Item from './Item';
import { testStory } from './testStory';

const renderItem = (item: Story) =>
  renderWithProviders(<Item item={item} />, { route: '/news/1', path: '/news/:page' });

describe('Item', () => {
  it('renders an external story with domain, points, user and comment links', () => {
    const { container } = renderItem(testStory());

    const title = screen.getByRole('link', { name: 'Story 42' });
    expect(title).toHaveAttribute('href', 'https://example.com/42');
    expect(title).not.toHaveAttribute('target');
    expect(screen.getByText('(example.com)')).toHaveClass('domain');

    const laptop = container.querySelector('.subtext-laptop')!;
    expect(laptop).toHaveTextContent('120 points by pg 3 hours ago | 7 comments');
    expect(laptop.querySelector('a[href="/item/42"]')).toHaveTextContent('7 comments');
    expect(laptop.querySelector('.item-details')).toBeInTheDocument();

    const palm = container.querySelector('.subtext-palm')!;
    expect(palm.querySelector('.right')).toHaveTextContent('120 ★');
    expect(palm.querySelector('.comment-number')).toHaveTextContent('• 7 comments');
    expect(palm.querySelector('.comment-number')).toHaveAttribute('href', '/item/42');
  });

  it('links self posts to the item page, sized but never in a new tab, without a domain', () => {
    localStorage.setItem('titleFontSize', '18');
    localStorage.setItem('openLinkInNewTab', 'true');
    const { container } = renderItem(
      testStory({ type: 'ask', url: 'item?id=42', domain: undefined, comments_count: 0 })
    );

    const title = screen.getByRole('link', { name: 'Story 42' });
    expect(title).toHaveAttribute('href', '/item/42');
    expect(title).toHaveStyle({ fontSize: '18px' });
    expect(title).not.toHaveAttribute('target');
    expect(container.querySelector('.domain')).not.toBeInTheDocument();
    expect(container.querySelector('.comment-number')).toHaveTextContent('• discuss');
  });

  it('hides points, user and comments for jobs', () => {
    const { container } = renderItem(testStory({ type: 'job', points: null, user: null }));

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
    const { container } = renderItem(testStory());

    const title = screen.getByRole('link', { name: 'Story 42' });
    expect(title).toHaveStyle({ fontSize: '20px' });
    expect(title).toHaveAttribute('target', '_blank');
    expect(title).toHaveAttribute('rel', 'noopener');
    expect(container.querySelector('.item-block > div')).toHaveStyle({ marginBottom: '15px' });
  });

  it.each([
    ['.comment-number', '/item/42'],
    ['.subtext-laptop a[href="/user/pg"]', '/user/pg'],
  ])('navigates from %s to %s', async (selector, path) => {
    const user = userEvent.setup();
    const { container } = renderItem(testStory());

    await user.click(container.querySelector(selector)!);
    expect(screen.getByTestId('location')).toHaveTextContent(path);
  });
});
