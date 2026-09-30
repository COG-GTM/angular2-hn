import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { hackerNewsApi } from '../api/hackernews';
import type { User } from '../api/types';
import { routerFuture } from '../routes';
import { Component as UserPage } from './UserPage';

vi.mock('../api/hackernews', () => ({
  hackerNewsApi: { fetchItemContent: vi.fn(), fetchUser: vi.fn(), fetchFeed: vi.fn(), fetchPollContent: vi.fn() },
}));

const fetchUser = vi.mocked(hackerNewsApi.fetchUser);

const user: User = {
  id: 'laurenth',
  created_time: 1709392302,
  created: '3 years ago',
  karma: 196,
  about: 'https:&#x2F;&#x2F;github.com&#x2F;laurenthuberdeau',
};

function renderUser() {
  const router = createMemoryRouter(
    [
      { path: '/prev', element: <div>previous page</div> },
      { path: '/user/:id', element: <UserPage /> },
    ],
    { initialEntries: ['/prev', '/user/laurenth'], initialIndex: 1, future: routerFuture },
  );
  const view = render(<RouterProvider router={router} future={{ v7_startTransition: true }} />);
  return { router, ...view };
}

describe('UserPage', () => {
  afterEach(() => {
    cleanup();
    fetchUser.mockReset();
  });

  it('shows the loader, then the profile with about', async () => {
    fetchUser.mockResolvedValue(user);
    const { container } = renderUser();
    expect(container.querySelector('.app-user > .app-loader')).toBeInTheDocument();
    expect(fetchUser).toHaveBeenCalledWith('laurenth', expect.any(AbortSignal));

    const profile = (await screen.findByText('laurenth', { selector: 'span.name' })).closest('.profile') as HTMLElement;
    expect(container.querySelector('.app-loader')).toBeNull();
    expect(profile.parentElement).toHaveClass('app-user');
    expect(profile.querySelector('.mobile.item-header > p.title-block')?.textContent?.trim()).toBe('Profile: laurenth');
    expect(profile.querySelector('.main-details > span.right')).toHaveTextContent('196 ★');
    expect(profile.querySelector('.main-details > p.age')).toHaveTextContent('Created 3 years ago');
    expect(profile.querySelector('.other-details > p')?.textContent).toBe('https://github.com/laurenthuberdeau');
  });

  it('omits other-details when the user has no about', async () => {
    fetchUser.mockResolvedValue({ ...user, about: undefined });
    const { container } = renderUser();
    await screen.findByText('laurenth', { selector: 'span.name' });
    expect(container.querySelector('.other-details')).toBeNull();
  });

  it('goes back when the mobile back button is clicked', async () => {
    fetchUser.mockResolvedValue(user);
    const { container, router } = renderUser();
    await screen.findByText('laurenth', { selector: 'span.name' });
    fireEvent.click(container.querySelector('span.back-button') as HTMLElement);
    expect(await screen.findByText('previous page')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/prev');
  });

  it('shows the Angular error message when loading fails', async () => {
    fetchUser.mockRejectedValue(new Error('404'));
    const { container } = renderUser();
    expect(await screen.findByText('Could not load user laurenth.')).toBeInTheDocument();
    expect(container.querySelector('.app-user > .app-error-message')).toBeInTheDocument();
    expect(container.querySelector('.profile')).toBeNull();
  });
});
