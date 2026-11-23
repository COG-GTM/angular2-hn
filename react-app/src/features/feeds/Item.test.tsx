import { screen } from '@testing-library/react';
import type { Story } from '../../api/types';
import { Item } from './Item';
import { renderRoutes, story } from './testUtils';

const renderItem = (item: Story) => renderRoutes([{ path: '/', element: <Item item={item} className="item-block" /> }], '/');

afterEach(() => vi.unstubAllGlobals());

describe('Item', () => {
  it('links external stories to their URL with the domain', () => {
    const { container } = renderItem(story());
    const title = container.querySelector('a.title')!;
    expect(title).toHaveAttribute('href', 'https://example.com/a');
    expect(title).not.toHaveAttribute('target');
    expect(title).toHaveTextContent('A story');
    expect(container.querySelector('.domain')).toHaveTextContent('(example.com)');
    expect(container.querySelector('.hn-item.item-block')).not.toBeNull();
  });

  it('links internal (ask) stories to the item page', () => {
    const { container } = renderItem(story({ id: 7, url: 'item?id=7', domain: undefined }));
    expect(container.querySelector('a.title')).toHaveAttribute('href', '/item/7');
    expect(container.querySelector('.domain')).toBeNull();
  });

  it('shows points, user and comment label on laptop and palm subtext', () => {
    const { container } = renderItem(story({ comments_count: 1 }));
    expect(container.querySelector('.subtext-laptop')).toHaveTextContent('42 points by pg 2 hours ago | 1 comment');
    expect(container.querySelector('.subtext-laptop .item-details a')).toHaveAttribute('href', '/item/1');
    expect(container.querySelector('.subtext-palm .right')).toHaveTextContent('42 ★');
    expect(container.querySelector('.subtext-palm .comment-number')).toHaveTextContent('• 1 comment');
    expect(screen.getAllByRole('link', { name: 'pg' })[0]).toHaveAttribute('href', '/user/pg');
  });

  it('hides points, user and comments for jobs', () => {
    const { container } = renderItem(story({ type: 'job', comments_count: 0 }));
    expect(container.querySelector('.subtext-laptop')).not.toHaveTextContent('points by');
    expect(container.querySelector('.item-details')).toBeNull();
    expect(container.querySelector('.comment-number')).toBeNull();
    expect(container.querySelector('.subtext-palm .name')).toBeNull();
    expect(container.querySelector('.subtext-laptop')).toHaveTextContent('2 hours ago');
  });

  it('honors titleFontSize, listSpacing and openLinkInNewTab', () => {
    localStorage.setItem('titleFontSize', '22');
    localStorage.setItem('listSpacing', '12');
    localStorage.setItem('openLinkInNewTab', 'true');
    const { container } = renderItem(story());
    const title = container.querySelector<HTMLElement>('a.title')!;
    expect(title.style.fontSize).toBe('22px');
    expect(title).toHaveAttribute('target', '_blank');
    expect(title).toHaveAttribute('rel', 'noopener');
    expect(container.querySelector<HTMLElement>('.hn-item > div')!.style.marginBottom).toBe('12px');
  });
});
