import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { hackerNewsApi } from '../api/hackernews';
import type { Story } from '../api/types';
import { routerFuture } from '../routes';
import { SettingsContext } from '../settings/SettingsContext';
import { DEFAULT_SETTINGS, type SettingsApi } from '../settings/types';
import { Component as ItemPage } from './ItemPage';

vi.mock('../api/hackernews', () => ({
  hackerNewsApi: { fetchItemContent: vi.fn(), fetchUser: vi.fn(), fetchFeed: vi.fn(), fetchPollContent: vi.fn() },
}));

const fetchItemContent = vi.mocked(hackerNewsApi.fetchItemContent);

const story: Story = {
  id: 42,
  title: 'Solving Factorio Quality',
  points: 86,
  user: 'laurenth',
  time: 0,
  time_ago: 'a day ago',
  type: 'link',
  url: 'https://exyr.org/2026/solving-factorio-quality/',
  domain: 'exyr.org',
  comments_count: 2,
  content: '<p>body</p>',
  comments: [
    {
      id: 1,
      level: 0,
      user: 'alice',
      time: 0,
      time_ago: '2 hours ago',
      content: 'top',
      comments: [{ id: 2, level: 1, user: 'bob', time: 0, time_ago: '1 hour ago', content: 'reply', comments: [] }],
    },
  ],
};

function renderItem(settings: Partial<SettingsApi['settings']> = {}) {
  const api: SettingsApi = {
    settings: { ...DEFAULT_SETTINGS, ...settings },
    toggleSettings: vi.fn(),
    toggleOpenLinksInNewTab: vi.fn(),
    setTheme: vi.fn(),
    setFont: vi.fn(),
    setSpacing: vi.fn(),
  };
  const router = createMemoryRouter(
    [
      { path: '/prev', element: <div>previous page</div> },
      { path: '/item/:id', element: <ItemPage /> },
    ],
    { initialEntries: ['/prev', '/item/42'], initialIndex: 1, future: routerFuture },
  );
  const view = render(
    <SettingsContext.Provider value={api}>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </SettingsContext.Provider>,
  );
  return { router, ...view };
}

describe('ItemPage', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    fetchItemContent.mockReset();
  });

  it('shows the loader, then the item header, subject and comment tree', async () => {
    fetchItemContent.mockResolvedValue(story);
    const { container } = renderItem();
    expect(container.querySelector('.app-item-details .main-content .app-loader')).toBeInTheDocument();
    expect(fetchItemContent).toHaveBeenCalledWith(42, expect.any(AbortSignal));
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);

    await screen.findAllByText('Solving Factorio Quality');
    expect(container.querySelector('.app-loader')).toBeNull();

    const laptop = container.querySelector('.item > .laptop') as HTMLElement;
    expect(laptop.className).toBe('laptop item-header');
    const title = laptop.querySelector('p > a.title') as HTMLElement;
    expect(title).toHaveAttribute('href', story.url);
    expect(title).not.toHaveAttribute('target');
    expect(title).not.toHaveAttribute('rel');
    expect(laptop.querySelector('p > span.domain')).toHaveTextContent('(exyr.org)');
    const subtext = laptop.querySelector('.subtext') as HTMLElement;
    expect(subtext.textContent?.replace(/\s+/g, ' ').trim()).toBe('86 points by laurenth a day ago | 2 comments');
    expect(subtext.querySelector('a[href="/user/laurenth"]')).toBeInTheDocument();
    expect(subtext.querySelector('span.item-details a[href="/item/42"]')).toHaveClass('active');

    expect(container.querySelector('.mobile.item-header > p.title-block > a.title')).toHaveAttribute('href', story.url);
    expect(container.querySelector('p.subject')?.innerHTML).toBe('<p>body</p>');
    expect(container.querySelectorAll('ul.comment-list > li > .app-comment')).toHaveLength(1);
    expect(container.querySelectorAll('.app-comment')).toHaveLength(2);
    expect(container.querySelector('.pollResults')).toBeNull();
  });

  it('opens external links in a new tab when the setting is on', async () => {
    fetchItemContent.mockResolvedValue(story);
    const { container } = renderItem({ openLinkInNewTab: true });
    await screen.findAllByText('Solving Factorio Quality');
    for (const link of container.querySelectorAll('a.title')) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener');
    }
  });

  it('links internally for items without an http url and hides points for jobs', async () => {
    fetchItemContent.mockResolvedValue({ ...story, type: 'job', url: 'item?id=42', comments_count: 0, comments: [] });
    const { container } = renderItem();
    await screen.findAllByText('Solving Factorio Quality');
    const laptop = container.querySelector('.laptop') as HTMLElement;
    expect(laptop.className).toBe('laptop item-header');
    expect(laptop.querySelector('a.title')).toHaveAttribute('href', '/item/42');
    expect(laptop.querySelector('.domain')).toBeNull();
    const subtext = laptop.querySelector('.subtext') as HTMLElement;
    expect(subtext.children).toHaveLength(1);
    expect(subtext.firstElementChild).not.toHaveClass('item-details');
    expect(subtext.textContent?.trim()).toBe('a day ago');
  });

  it('omits the item-header class on the laptop header when there are no comments', async () => {
    fetchItemContent.mockResolvedValue({ ...story, comments_count: 0, comments: [] });
    const { container } = renderItem();
    await screen.findAllByText('Solving Factorio Quality');
    expect(container.querySelector('.laptop')?.className).toBe('laptop');
    expect(container.querySelector('.laptop .item-details')).toHaveTextContent('discuss');
  });

  it('renders poll options with bars sized by share of votes', async () => {
    fetchItemContent.mockResolvedValue({
      ...story,
      type: 'poll',
      poll: [
        { content: 'Yes', points: 30 },
        { content: '<b>No</b>', points: 10 },
      ],
      poll_votes_count: 40,
    });
    const { container } = renderItem();
    await screen.findAllByText('Solving Factorio Quality');
    const options = container.querySelectorAll('.pollResults > .pollContent');
    expect(options).toHaveLength(2);
    expect(options[1].firstElementChild?.innerHTML).toBe('<b>No</b>');
    expect(options[1].querySelector('.subtext')).toHaveTextContent('10 points');
    expect((options[0].querySelector('.pollBar') as HTMLElement).style.width).toBe('75%');
    expect((options[1].querySelector('.pollBar') as HTMLElement).style.width).toBe('25%');
  });

  it('goes back when the mobile back button is clicked', async () => {
    fetchItemContent.mockResolvedValue(story);
    const { container, router } = renderItem();
    await screen.findAllByText('Solving Factorio Quality');
    fireEvent.click(container.querySelector('.mobile.item-header span.back-button') as HTMLElement);
    expect(await screen.findByText('previous page')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/prev');
  });

  it('shows the Angular error message when loading fails', async () => {
    fetchItemContent.mockRejectedValue(new Error('boom'));
    const { container } = renderItem();
    expect(await screen.findByText('Could not load item comments.')).toBeInTheDocument();
    expect(container.querySelector('.app-item-details .main-content .app-error-message')).toBeInTheDocument();
    expect(container.querySelector('.item')).toBeNull();
  });
});
