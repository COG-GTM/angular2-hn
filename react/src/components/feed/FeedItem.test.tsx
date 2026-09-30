import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import type { Story } from '../../api/types';
import { SettingsContext } from '../../settings/SettingsContext';
import { DEFAULT_SETTINGS, type Settings, type SettingsApi } from '../../settings/types';
import { FeedItem } from './FeedItem';

const noop = () => {};

function renderItem(item: Story, settings: Partial<Settings> = {}) {
  const api: SettingsApi = {
    settings: { ...DEFAULT_SETTINGS, ...settings },
    toggleSettings: noop,
    toggleOpenLinksInNewTab: noop,
    setTheme: noop,
    setFont: noop,
    setSpacing: noop,
  };
  return render(
    <SettingsContext.Provider value={api}>
      <MemoryRouter>
        <FeedItem item={item} />
      </MemoryRouter>
    </SettingsContext.Provider>,
  );
}

const link: Story = {
  id: 42,
  title: 'Pi.dev: You Said No MCP',
  points: 55,
  user: 'yarapavan',
  time: 0,
  time_ago: 'an hour ago',
  type: 'link',
  url: 'https://earendil.com/post',
  domain: 'earendil.com',
  comments_count: 17,
};

describe('FeedItem', () => {
  afterEach(cleanup);

  it('renders the host wrapper and an external title link with domain', () => {
    const { container } = renderItem(link);
    expect(container.firstElementChild).toHaveClass('app-item', 'item-block');
    const title = container.querySelector('a.title')!;
    expect(title).toHaveAttribute('href', 'https://earendil.com/post');
    expect(title).not.toHaveAttribute('target');
    expect(title).not.toHaveAttribute('rel');
    expect(title.textContent).toBe(' Pi.dev: You Said No MCP ');
    expect(container.querySelector('.domain')).toHaveTextContent('(earendil.com)');
  });

  it('links to /item/:id when the url is not http(s)', () => {
    const { container } = renderItem({ ...link, url: 'item?id=42', domain: undefined, type: 'ask' });
    expect(container.querySelector('a.title')).toHaveAttribute('href', '/item/42');
    expect(container.querySelector('.domain')).toBeNull();
  });

  it('renders laptop and palm subtext with user and comment links', () => {
    const { container } = renderItem(link);
    const laptop = container.querySelector('.subtext-laptop')!;
    expect(laptop.textContent).toBe(' 55 points by yarapavan an hour ago  |  17 comments ');
    expect(laptop.querySelector('a[href="/user/yarapavan"]')).not.toBeNull();
    expect(laptop.querySelector('.item-details a')).toHaveAttribute('href', '/item/42');

    const palm = container.querySelector('.subtext-palm')!;
    expect(palm.querySelector('.name a')).toHaveAttribute('href', '/user/yarapavan');
    expect(palm.querySelector('.right')).toHaveTextContent('55 ★');
    expect(palm.querySelector('a.comment-number')).toHaveAttribute('href', '/item/42');
    expect(palm.querySelector('a.comment-number')!.textContent).toBe(' • 17 comments ');
  });

  it('uses the comment label for zero and one comments', () => {
    renderItem({ ...link, comments_count: 0 });
    expect(screen.getAllByText('discuss', { exact: false })).toHaveLength(2);
  });

  it('omits points, user and comments for job items', () => {
    const { container } = renderItem({
      ...link,
      type: 'job',
      points: null,
      user: null,
      time_ago: '6 days ago',
      comments_count: 0,
    });
    expect(container.querySelector('.subtext-laptop')!.textContent).toBe(' 6 days ago ');
    expect(container.querySelector('.subtext-laptop .item-details')).toBeNull();
    expect(container.querySelectorAll('.subtext-palm .details')).toHaveLength(1);
    expect(container.querySelector('.comment-number')).toBeNull();
    expect(container.querySelector('a[href^="/user/"]')).toBeNull();
    expect(container.querySelector('a[href^="/item/"]')).toBeNull();
    expect(container.textContent).not.toContain('points');
  });

  it('applies titleFontSize, listSpacing and openLinkInNewTab settings', () => {
    const { container } = renderItem(link, { titleFontSize: '20', listSpacing: '12', openLinkInNewTab: true });
    const title = container.querySelector('a.title') as HTMLElement;
    expect(title.style.fontSize).toBe('20px');
    expect(title).toHaveAttribute('target', '_blank');
    expect(title).toHaveAttribute('rel', 'noopener');
    expect((container.querySelector('.app-item > div') as HTMLElement).style.marginBottom).toBe('12px');
  });

  it('does not add target to internal title links', () => {
    const { container } = renderItem({ ...link, url: 'item?id=42' }, { openLinkInNewTab: true, titleFontSize: '18' });
    const title = container.querySelector('a.title') as HTMLElement;
    expect(title).not.toHaveAttribute('target');
    expect(title.style.fontSize).toBe('18px');
  });
});
