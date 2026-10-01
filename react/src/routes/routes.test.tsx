import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { HN_API_BASE_URL } from '../api/hn';
import { FEED_NAMES } from '../api/types';
import { App } from '../App';
import { mockFetch } from '../test/fetchMock';
import { newsPage1 } from '../test/fixtures/stories';
import { routes } from './routes';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<App router={router} />);
  return router;
}

function mockAllFeeds() {
  return mockFetch(
    Object.fromEntries(
      FEED_NAMES.flatMap((feed) => [1, 2].map((p) => [`${HN_API_BASE_URL}/${feed}?page=${p}`, newsPage1])),
    ),
  );
}

describe('route table', () => {
  it.each([
    ['/news', 'feed'],
    ['/newest', 'feed'],
    ['/show', 'feed'],
    ['/ask', 'feed'],
    ['/jobs?page=2', 'feed'],
    ['/item/123', 'Item details coming soon.'],
    ['/user/pg', 'User profile coming soon.'],
    ['/does/not/exist', 'Page not found.'],
  ])('renders the shell and page content for %s', async (path, expected) => {
    mockAllFeeds();
    renderAt(path);

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toHaveTextContent('GitHub');
    if (expected === 'feed') {
      expect(await screen.findByText(newsPage1[0].title)).toBeInTheDocument();
    } else {
      expect(await screen.findByText(expected)).toBeInTheDocument();
    }
  });

  it('redirects / to /news', async () => {
    mockAllFeeds();
    const router = renderAt('/');
    expect(await screen.findByText(newsPage1[0].title)).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/news');
  });
});

describe('header navigation', () => {
  it.each([
    ['new', '/newest'],
    ['show', '/show'],
    ['ask', '/ask'],
    ['jobs', '/jobs'],
  ])('"%s" navigates to %s and becomes active', async (label, path) => {
    const spy = mockAllFeeds();
    const user = userEvent.setup();
    const router = renderAt('/news');
    const nav = screen.getByRole('navigation');

    await user.click(within(nav).getByRole('link', { name: label }));

    expect(router.state.location.pathname).toBe(path);
    expect(within(nav).getByRole('link', { name: label })).toHaveClass('active');
    await screen.findByText(newsPage1[0].title);
    expect(spy).toHaveBeenCalledWith(`${HN_API_BASE_URL}${path}?page=1`, expect.anything());
  });

  it('logo links home to /news', async () => {
    mockAllFeeds();
    const user = userEvent.setup();
    const router = renderAt('/user/pg');
    await user.click(screen.getByRole('link', { name: 'Home' }));
    expect(router.state.location.pathname).toBe('/news');
  });
});
