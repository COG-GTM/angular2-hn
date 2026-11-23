import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { fetchItemContent, fetchPollResults } from '../../api/hn';
import type { Story } from '../../api/types';
import { SettingsProvider } from '../../settings/SettingsContext';
import ItemDetails from './ItemDetails';

vi.mock('../../api/hn', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../api/hn')>()),
  fetchItemContent: vi.fn(),
  fetchPollResults: vi.fn(),
}));
const fetchItem = vi.mocked(fetchItemContent);
const fetchPoll = vi.mocked(fetchPollResults);

const story: Story = {
  id: 42, title: 'A story', points: 100, user: 'pg', time: 0, time_ago: '3 hours ago', type: 'link',
  url: 'https://example.com/a', domain: 'example.com', comments_count: 2,
  comments: [
    { id: 1, level: 0, user: 'alice', time: 0, time_ago: '2 hours ago', content: 'first', comments: [
      { id: 2, level: 1, user: 'bob', time: 0, time_ago: '1 hour ago', content: 'second', comments: [] },
    ] },
    { id: 3, level: 0, user: '', time: 0, time_ago: '', content: '', deleted: true, comments: [] },
  ],
};

function renderAt(item: Story | Error, entries = ['/item/42']) {
  fetchItem.mockImplementation(() => (item instanceof Error ? Promise.reject(item) : Promise.resolve(item)));
  const router = createMemoryRouter(
    [{ path: '/item/:id', element: <ItemDetails /> }, { path: '/news/1', element: <p>news page</p> }],
    { initialEntries: entries, initialIndex: entries.length - 1 }
  );
  return render(<SettingsProvider><RouterProvider router={router} /></SettingsProvider>);
}

beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  vi.stubGlobal('scrollTo', vi.fn());
});
afterEach(() => vi.unstubAllGlobals());

describe('ItemDetails', () => {
  it('shows the loader, then the header, subtext and comment tree, and scrolls to top', async () => {
    const { container } = renderAt(story);
    expect(container.querySelector('.loader')).toBeInTheDocument();
    expect(await screen.findAllByText('A story')).toHaveLength(2);
    expect(fetchItem).toHaveBeenCalledWith(42, expect.any(AbortSignal));
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    const laptop = container.querySelector('.laptop') as HTMLElement;
    expect(laptop).toHaveClass('item-header');
    expect(laptop.querySelector('a.title')).toHaveAttribute('href', 'https://example.com/a');
    expect(laptop.querySelector('a.title')).not.toHaveAttribute('target');
    expect(laptop.querySelector('.domain')).toHaveTextContent('(example.com)');
    expect(laptop.querySelector('.subtext')).toHaveTextContent('100 points by pg 3 hours ago | 2 comments');
    expect(laptop.querySelector('.subtext a[href="/item/42"]')).toHaveTextContent('2 comments');
    expect(container.querySelectorAll('ul.comment-list > li')).toHaveLength(2);
    expect(container.querySelectorAll('.comment-list .meta')).toHaveLength(2);
    expect(container.querySelectorAll('.comment-list .deleted-meta')).toHaveLength(1);
  });

  it('opens external titles in a new tab when the setting is on', async () => {
    localStorage.setItem('openLinkInNewTab', 'true');
    const { container } = renderAt(story);
    await screen.findAllByText('A story');
    for (const a of container.querySelectorAll('a.title')) {
      expect(a).toHaveAttribute('target', '_blank');
      expect(a).toHaveAttribute('rel', 'noopener');
    }
  });

  it('routes ask posts internally and renders their HTML content', async () => {
    const { container } = renderAt({ ...story, type: 'ask', url: 'item?id=42', domain: undefined, content: '<p>Ask <i>body</i></p>', comments_count: 0, comments: [] });
    await screen.findAllByText('A story');
    expect(container.querySelector('.laptop a.title')).toHaveAttribute('href', '/item/42');
    expect(container.querySelector('.laptop .domain')).toBeNull();
    expect(container.querySelector('.laptop')).not.toHaveClass('item-header');
    expect(container.querySelector('.laptop .subtext')).toHaveTextContent('discuss');
    expect(container.querySelector('p.subject i')).toHaveTextContent('body');
  });

  it('shows job posts without points, author or comments', async () => {
    const { container } = renderAt({ ...story, type: 'job', comments_count: 0, comments: [] });
    await screen.findAllByText('A story');
    const subtext = container.querySelector('.laptop .subtext') as HTMLElement;
    expect(subtext).toHaveTextContent(/^3 hours ago$/);
    expect(subtext.querySelector('.item-details')).toBeNull();
    expect(container.querySelector('.laptop')).toHaveClass('item-header');
  });

  it('draws poll options with bars proportional to their votes', async () => {
    fetchPoll.mockResolvedValue([{ points: 30, content: 'Yes' }, { points: 10, content: 'No' }]);
    const { container } = renderAt({ ...story, type: 'poll', poll: [{ points: 30, content: 'Yes' }, { points: 10, content: 'No' }] });
    await screen.findAllByText('A story');
    const rows = container.querySelectorAll<HTMLElement>('.pollResults .pollContent');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('Yes30 points');
    expect(rows[0].querySelector('.pollBar')).toHaveStyle({ width: '75%' });
    expect(rows[1].querySelector('.pollBar')).toHaveStyle({ width: '25%' });
  });

  it('shows the discussion with the feed poll entries while options load, then the loaded options', async () => {
    let resolvePoll!: (poll: { points: number; content: string }[]) => void;
    fetchPoll.mockReturnValue(new Promise((resolve) => (resolvePoll = resolve)));
    const { container } = renderAt({ ...story, type: 'poll', poll: [{ points: 1, content: 'feed yes' }, { points: 1, content: 'feed no' }] });
    await screen.findByText('first');
    expect(container.querySelector('.pollResults')).toHaveTextContent('feed yes1 points');
    resolvePoll([{ points: 3, content: 'Yes' }, { points: 1, content: 'No' }]);
    expect(await screen.findByText('Yes')).toBeInTheDocument();
    expect(container.querySelector('.pollBar')).toHaveStyle({ width: '75%' });
  });

  it('shows the error message when the item fails to load', async () => {
    renderAt(new Error('404'));
    expect(await screen.findByText('Could not load item comments.')).toBeInTheDocument();
  });

  it('the mobile back button goes back in history', async () => {
    const { container } = renderAt(story, ['/news/1', '/item/42']);
    await screen.findAllByText('A story');
    await userEvent.click(container.querySelector('.mobile.item-header .back-button') as HTMLElement);
    expect(await screen.findByText('news page')).toBeInTheDocument();
  });

  it('the mobile back button works from the keyboard', async () => {
    renderAt(story, ['/news/1', '/item/42']);
    await screen.findAllByText('A story');
    screen.getByRole('button', { name: 'Back' }).focus();
    await userEvent.keyboard('{Enter}');
    expect(await screen.findByText('news page')).toBeInTheDocument();
  });
});
