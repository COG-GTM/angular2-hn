import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, expect, it, vi } from 'vitest';
import { fetchFeed } from '../api/hackerNewsApi';
import type { FeedType, Story } from '../models';
import { SettingsProvider, useSettings } from '../settings';
import { FeedPage } from './FeedPage';
import { FeedItem } from './FeedItem';

vi.mock('../api/hackerNewsApi', () => ({ fetchFeed: vi.fn() }));
const story: Story = { id: 1, title: 'A story', points: 42, user: 'alice', time: 0, time_ago: 2,
  type: 'story', url: 'https://example.com', domain: 'example.com', comments: [], comments_count: 1,
  poll: [], poll_votes_count: 0, deleted: false, dead: false };
beforeEach(() => { vi.mocked(fetchFeed).mockReset(); vi.spyOn(window, 'scrollTo').mockImplementation(() => {}); });
function feed(type: FeedType = 'news', page = 1) {
  return render(<MemoryRouter initialEntries={[`/${type}/${page}`]}><SettingsProvider>
    <Routes><Route path="/:type/:page" element={<FeedPage feedType={type} />} /></Routes>
  </SettingsProvider></MemoryRouter>);
}
it('shows loading until the request resolves', () => {
  vi.mocked(fetchFeed).mockReturnValue(new Promise(() => {}));
  feed();
  expect(screen.getByText('Loading...')).toBeTruthy();
});
it('shows the feed-specific error', async () => {
  vi.mocked(fetchFeed).mockRejectedValue(new Error('offline'));
  feed('show');
  expect(await screen.findByText('Could not load show stories.')).toBeTruthy();
});
it('renders an empty list without a more link', async () => {
  vi.mocked(fetchFeed).mockResolvedValue([]);
  feed();
  expect(await screen.findByRole('list')).toBeTruthy();
  expect(screen.queryByRole('link', { name: 'More ›' })).toBeNull();
  expect(screen.queryByRole('link', { name: '‹ Prev' })).toBeNull();
});
it.each(['news', 'newest', 'show', 'ask', 'jobs'] as const)('paginates %s with numbered lists', async type => {
  vi.mocked(fetchFeed).mockResolvedValue(Array.from({ length: 30 }, (_, i) => ({ ...story, id: i, type: type === 'jobs' ? 'job' : 'story', url: type === 'ask' ? 'item?id=1' : story.url })));
  feed(type);
  const more = await screen.findByRole('link', { name: 'More ›' });
  expect(more.getAttribute('href')).toBe(`/${type}/2`);
  expect(screen.queryByRole('link', { name: '‹ Prev' })).toBeNull();
  expect(screen.getByRole('list').getAttribute('start')).toBe('1');
  if (type === 'jobs') {
    expect(screen.getByText(/These are jobs/)).toBeTruthy();
    expect(screen.queryByText('42 points by')).toBeNull();
  }
  if (type === 'ask') expect(screen.getAllByRole('link', { name: 'A story' })[0].getAttribute('href')).toBe('/item/0');
  fireEvent.click(more);
  await waitFor(() => expect(screen.getByRole('list').getAttribute('start')).toBe('31'));
  expect(screen.getByRole('link', { name: '‹ Prev' }).getAttribute('href')).toBe(`/${type}/1`);
  expect(fetchFeed).toHaveBeenLastCalledWith(type, 2, expect.any(AbortSignal));
});
function Controls() {
  const { setFont, setSpacing, toggleOpenLinksInNewTab } = useSettings();
  return <button onClick={() => { setFont('20'); setSpacing('12'); toggleOpenLinksInNewTab(); }}>Settings</button>;
}
it('updates item settings live and keeps internal links in the same tab', () => {
  const { container } = render(<MemoryRouter><SettingsProvider><Controls /><FeedItem item={story} />
    <FeedItem item={{ ...story, id: 2, title: 'Ask HN', url: 'item?id=2', domain: '', comments_count: 0 }} />
  </SettingsProvider></MemoryRouter>);
  const title = screen.getByRole('link', { name: 'A story' });
  expect(title.getAttribute('target')).toBeNull();
  expect(title.style.fontSize).toBe('16px');
  expect(screen.getAllByText('1 comment')).toHaveLength(1);
  expect(screen.getAllByText('discuss')).toHaveLength(1);
  fireEvent.click(screen.getByRole('button'));
  expect(title.getAttribute('target')).toBe('_blank');
  expect(title.getAttribute('rel')).toBe('noopener');
  expect(title.style.fontSize).toBe('20px');
  expect((container.querySelector('.feed-item > div') as HTMLElement).style.marginBottom).toBe('12px');
  expect(screen.getByRole('link', { name: 'Ask HN' }).getAttribute('target')).toBeNull();
  fireEvent.click(screen.getByRole('button'));
  expect(title.getAttribute('target')).toBeNull();
});
it('ignores an obsolete feed request after navigation', async () => {
  let resolve!: (items: Story[]) => void;
  vi.mocked(fetchFeed).mockReturnValueOnce(new Promise(done => { resolve = done; })).mockResolvedValueOnce([]);
  const view = feed();
  view.unmount();
  feed('ask');
  await screen.findByRole('list');
  resolve([story]);
  await waitFor(() => expect(screen.queryByText('A story')).toBeNull());
});
