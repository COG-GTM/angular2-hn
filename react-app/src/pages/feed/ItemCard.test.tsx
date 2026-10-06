import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { askStory, jobStory, linkStory } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import type { Story } from '../../types';
import { ItemCard } from './ItemCard';

function renderItem(item: Story) {
  return renderWithProviders(<ItemCard item={item} />);
}

describe('ItemCard', () => {
  it('renders an external title link with the domain', () => {
    renderItem(linkStory);
    const title = screen.getByRole('link', { name: linkStory.title });
    expect(title).toHaveClass('title');
    expect(title).toHaveAttribute('href', 'https://example.com/post');
    expect(title).not.toHaveAttribute('target');
    expect(title).not.toHaveAttribute('rel');
    expect(document.querySelector('.domain')).toHaveTextContent('(example.com)');
  });

  it('opens external links in a new tab when the setting is on', () => {
    localStorage.setItem('openLinkInNewTab', 'true');
    renderItem(linkStory);
    const title = screen.getByRole('link', { name: linkStory.title });
    expect(title).toHaveAttribute('target', '_blank');
    expect(title).toHaveAttribute('rel', 'noopener');
  });

  it('renders an internal title link for HN-internal items without a domain', () => {
    localStorage.setItem('openLinkInNewTab', 'true');
    renderItem(askStory);
    const title = screen.getByRole('link', { name: askStory.title });
    expect(title).toHaveAttribute('href', '/item/1002');
    expect(title).not.toHaveAttribute('target');
    expect(document.querySelector('.domain')).not.toBeInTheDocument();
  });

  it('renders the laptop and palm subtext with points, user and comment label', () => {
    renderItem(linkStory);
    const laptop = document.querySelector('.subtext-laptop')!;
    expect(laptop).toHaveTextContent('120 points by alice 2 hours ago | 12 comments');
    expect(laptop.querySelector('a[href="/user/alice"]')).toBeInTheDocument();
    expect(laptop.querySelector('.item-details a')).toHaveAttribute('href', '/item/1001');

    const palm = document.querySelector('.subtext-palm')!;
    expect(palm.querySelector('.name a')).toHaveAttribute('href', '/user/alice');
    expect(palm.querySelector('.right')).toHaveTextContent('120 ★');
    expect(palm.querySelector('a.comment-number')).toHaveTextContent('• 12 comments');
    expect(palm.querySelector('a.comment-number')).toHaveAttribute('href', '/item/1001');
  });

  it.each([
    [0, 'discuss'],
    [1, '1 comment'],
    [5, '5 comments'],
  ])('labels %i comments as "%s"', (count, label) => {
    renderItem({ ...linkStory, comments_count: count });
    expect(document.querySelector('.subtext-laptop .item-details a')).toHaveTextContent(label);
    expect(document.querySelector('.subtext-palm .comment-number')).toHaveTextContent(`• ${label}`);
  });

  it('hides points, user and comments for job items', () => {
    renderItem(jobStory);
    expect(screen.getByRole('link', { name: jobStory.title })).toHaveAttribute('href', jobStory.url);
    expect(screen.getAllByText(jobStory.time_ago)).toHaveLength(2);
    expect(screen.queryByText(/points by/)).not.toBeInTheDocument();
    expect(screen.queryByText(/★/)).not.toBeInTheDocument();
    expect(screen.queryByText(/discuss|comment/)).not.toBeInTheDocument();
    expect(document.querySelector('a[href^="/user/"]')).not.toBeInTheDocument();
    expect(document.querySelector('a[href^="/item/"]')).not.toBeInTheDocument();
    expect(document.querySelector('.item-details')).not.toBeInTheDocument();
    expect(document.querySelector('.subtext-palm .details .name')).not.toBeInTheDocument();
  });

  it('applies title font size and list spacing from settings', () => {
    localStorage.setItem('titleFontSize', '20');
    localStorage.setItem('listSpacing', '12');
    renderItem(linkStory);
    expect(screen.getByRole('link', { name: linkStory.title })).toHaveStyle({ fontSize: '20px' });
    expect(document.querySelector('.item-card')).toHaveStyle({ marginBottom: '12px' });
  });

  it('uses the default font size and spacing', () => {
    renderItem(askStory);
    expect(screen.getByRole('link', { name: askStory.title })).toHaveStyle({ fontSize: '16px' });
    expect(document.querySelector('.item-card')).toHaveStyle({ marginBottom: '0px' });
  });
});
