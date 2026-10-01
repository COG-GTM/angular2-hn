import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { HN_API_BASE_URL, HN_FIREBASE_BASE_URL } from '../../api/hn';
import type { User } from '../../api/types';
import { createdDate, sanitizeAbout } from '../../pages/UserPage';
import { mockFetch } from '../../test/fetchMock';
import { UserSlot } from './user';

/** Shape returned by node-hnapi `/user/{id}`. */
const nodeUser: User = {
  id: 'pg',
  created_time: 1160418092,
  created: '19 years ago',
  karma: 157316,
  avg: null,
  about: 'Bug fixer.<p>Essays: <a href="http://paulgraham.com">paulgraham.com</a>',
};

/** Shape returned by `hacker-news.firebaseio.com/v0/user/{id}.json`. */
const firebaseUser = {
  id: 'dang',
  created: 1301344840,
  karma: 100000,
  about: 'Moderator.',
  submitted: Array.from({ length: 65 }, (_, i) => 40000000 - i),
};

function renderUser(url: string) {
  const router = createMemoryRouter(
    [
      { path: '/news', element: <p>news page</p> },
      { path: '/user/:id', element: <UserSlot /> },
      { path: '/item/:id', element: <p>item page</p> },
    ],
    { initialEntries: ['/news', url], initialIndex: 1 },
  );
  render(<RouterProvider router={router} />);
  return router;
}

describe('createdDate', () => {
  it('formats unix seconds as an ISO date', () => {
    expect(createdDate(1160418092)).toBe('2006-10-09');
  });
});

describe('sanitizeAbout', () => {
  it('keeps formatting and http links, drops scripts and javascript: urls', () => {
    expect(sanitizeAbout('<p>hi <a href="https://x.y">x</a></p><script>bad()</script>')).toBe(
      '<p>hi <a href="https://x.y">x</a></p>',
    );
    expect(sanitizeAbout('<a href="javascript:alert(1)" onclick="y()">z</a>')).toBe('<a>z</a>');
  });
});

describe('UserSlot (lazy /user/:id)', () => {
  it('renders id, karma, created date and about from node-hnapi', async () => {
    mockFetch({ [`${HN_API_BASE_URL}/user/pg`]: nodeUser });
    renderUser('/user/pg');

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(await screen.findByLabelText('Karma')).toHaveTextContent('157316 ★');
    expect(screen.getAllByText('pg').length).toBeGreaterThan(0);
    expect(screen.getByText('Profile: pg')).toBeInTheDocument();
    const created = screen.getByText('19 years ago');
    expect(created.tagName).toBe('TIME');
    expect(created).toHaveAttribute('dateTime', '2006-10-09');
    const about = screen.getByTestId('about');
    expect(about).toHaveTextContent('Bug fixer.');
    expect(within(about).getByRole('link', { name: 'paulgraham.com' })).toHaveAttribute('href', 'http://paulgraham.com');
    expect(screen.queryByRole('region', { name: 'Submissions' })).not.toBeInTheDocument();
  });

  it('omits the about block when empty', async () => {
    mockFetch({ [`${HN_API_BASE_URL}/user/pg`]: { ...nodeUser, about: '' } });
    renderUser('/user/pg');
    await screen.findByLabelText('Karma');
    expect(screen.queryByTestId('about')).not.toBeInTheDocument();
  });

  it('lists submissions from the Firebase fallback, 30 at a time', async () => {
    const user = userEvent.setup();
    mockFetch({
      [`${HN_API_BASE_URL}/user/dang`]: { status: 404, body: {} },
      [`${HN_FIREBASE_BASE_URL}/user/dang.json`]: firebaseUser,
    });
    renderUser('/user/dang');

    const section = await screen.findByRole('region', { name: 'Submissions' });
    expect(within(section).getByRole('heading')).toHaveTextContent('Submissions (65)');
    expect(within(section).getAllByRole('link')).toHaveLength(30);
    expect(within(section).getByRole('link', { name: '40000000' })).toHaveAttribute('href', '/item/40000000');
    expect(screen.getByLabelText('Karma')).toHaveTextContent('100000 ★');
    expect(screen.getByText('Moderator.')).toBeInTheDocument();

    await user.click(within(section).getByRole('button', { name: 'More ›' }));
    expect(within(section).getAllByRole('link')).toHaveLength(60);
    await user.click(within(section).getByRole('button', { name: 'More ›' }));
    expect(within(section).getAllByRole('link')).toHaveLength(65);
    expect(within(section).queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows the Angular error message when the user cannot be loaded', async () => {
    mockFetch({
      [`${HN_API_BASE_URL}/user/nobody`]: { status: 404, body: {} },
      [`${HN_FIREBASE_BASE_URL}/user/nobody.json`]: null,
    });
    renderUser('/user/nobody');
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load user nobody.');
  });

  it('goes back from the mobile back button', async () => {
    const user = userEvent.setup();
    mockFetch({ [`${HN_API_BASE_URL}/user/pg`]: nodeUser });
    const router = renderUser('/user/pg');
    await user.click(await screen.findByRole('button', { name: 'Back' }));
    expect(router.state.location.pathname).toBe('/news');
  });
});
