import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { HN_API_BASE_URL } from '../../api/hn';
import type { Item } from '../../api/types';
import { SettingsProvider } from '../../hooks/useSettings';
import { pollPercent } from '../../pages/ItemPage';
import { mockFetch } from '../../test/fetchMock';
import { newsPage1 } from '../../test/fixtures/stories';
import { ItemSlot } from './item';

const [link, ask, job] = newsPage1;

const story: Item = {
  ...link,
  content: '',
  comments: [
    {
      id: 1,
      level: 0,
      user: 'carol',
      time: 1,
      time_ago: '1 hour ago',
      content: '<p>Top level</p>',
      comments: [{ id: 2, level: 1, user: 'dave', time: 2, time_ago: '50 minutes ago', content: '<p>Reply</p>', comments: [] }],
    },
  ],
};

function renderItem(url: string) {
  const router = createMemoryRouter(
    [
      { path: '/news', element: <p>news page</p> },
      { path: '/item/:id', element: <ItemSlot /> },
    ],
    { initialEntries: ['/news', url], initialIndex: 1 },
  );
  render(
    <SettingsProvider>
      <RouterProvider router={router} />
    </SettingsProvider>,
  );
  return router;
}

describe('pollPercent', () => {
  it.each([
    [30, 42, (30 / 42) * 100],
    [0, 42, 0],
    [5, 0, 0],
    [5, undefined, 0],
  ])('pollPercent(%i, %s)', (points, total, expected) => {
    expect(pollPercent(points, total)).toBeCloseTo(expected);
  });
});

describe('ItemSlot (lazy /item/:id)', () => {
  it('lazy-loads the page and renders the story with its comment tree', async () => {
    mockFetch({ [`${HN_API_BASE_URL}/item/${link.id}`]: story });
    renderItem(`/item/${link.id}`);

    expect(screen.getByRole('status')).toBeInTheDocument();
    const comments = await screen.findByRole('list', { name: 'Comments' });
    expect(within(comments).getByText('Top level')).toBeInTheDocument();
    expect(within(comments).getByText('Reply')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: link.title })[0]).toHaveAttribute('href', link.url);
    expect(screen.getByText('(example.com)')).toBeInTheDocument();
    expect(screen.getByText(/312 points by/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '87 comments' })).toHaveAttribute('href', `/item/${link.id}`);
  });

  it('renders self-post text and an internal title link', async () => {
    mockFetch({
      [`${HN_API_BASE_URL}/item/${ask.id}`]: { ...ask, content: '<p>Tell us <b>everything</b></p>', comments: [] },
    });
    renderItem(`/item/${ask.id}`);
    expect(await screen.findByText('everything')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: ask.title })[0]).toHaveAttribute('href', `/item/${ask.id}`);
    expect(screen.getByRole('link', { name: '1 comment' })).toBeInTheDocument();
  });

  it('hides points, user and comment count for jobs', async () => {
    mockFetch({ [`${HN_API_BASE_URL}/item/${job.id}`]: { ...job, comments: [] } });
    renderItem(`/item/${job.id}`);
    await screen.findByText('1 hour ago');
    expect(screen.queryByText(/points by/)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /discuss|comment/ })).not.toBeInTheDocument();
  });

  it('renders poll options with vote-proportional bars', async () => {
    mockFetch({
      [`${HN_API_BASE_URL}/item/100`]: {
        ...ask,
        id: 100,
        type: 'poll',
        comments: [],
        poll: [
          { item: 'Tabs', points: 0 },
          { item: 'Spaces', points: 0 },
        ],
      },
      [`${HN_API_BASE_URL}/item/101`]: { content: '<p>Tabs</p>', points: 30 },
      [`${HN_API_BASE_URL}/item/102`]: { content: '<p>Spaces</p>', points: 10 },
    });
    renderItem('/item/100');

    const poll = await screen.findByRole('list', { name: 'Poll results' });
    const options = within(poll).getAllByRole('listitem');
    expect(options).toHaveLength(2);
    expect(within(options[0]).getByText('Tabs')).toBeInTheDocument();
    expect(within(options[0]).getByText('30 points')).toBeInTheDocument();
    const bars = within(poll).getAllByTestId('poll-bar');
    expect(bars[0]).toHaveStyle({ width: '75%' });
    expect(bars[1]).toHaveStyle({ width: '25%' });
  });

  it('shows the Angular error message when the API fails', async () => {
    mockFetch({ [`${HN_API_BASE_URL}/item/5`]: { status: 500, body: {} } });
    renderItem('/item/5');
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load item comments.');
  });

  it('rejects non-numeric ids without calling the API', async () => {
    const spy = mockFetch({});
    renderItem('/item/abc');
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load item comments.');
    expect(spy).not.toHaveBeenCalled();
  });

  it('goes back from the mobile back button', async () => {
    const user = userEvent.setup();
    mockFetch({ [`${HN_API_BASE_URL}/item/${link.id}`]: story });
    const router = renderItem(`/item/${link.id}`);
    await user.click(await screen.findByRole('button', { name: 'Back' }));
    expect(router.state.location.pathname).toBe('/news');
  });
});
