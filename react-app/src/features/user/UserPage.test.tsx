import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchUser } from '../../api/hackernews';
import type { User } from '../../models';
import { renderWithProviders } from '../../test/renderWithProviders';
import UserPage from './UserPage';

vi.mock('../../api/hackernews');

const mockedFetchUser = vi.mocked(fetchUser);

const pg: User = {
  id: 'pg',
  created_time: 1160418092,
  created: '19 years ago',
  karma: 157316,
  about: 'Bug fixer. <a href="http://paulgraham.com">paulgraham.com</a><pre>code</pre>',
};

function renderUser(route = '/user/pg') {
  return renderWithProviders(<UserPage />, { route, path: '/user/:id' });
}

describe('UserPage', () => {
  beforeEach(() => {
    mockedFetchUser.mockReset();
  });

  it('shows the loader while the user is loading', () => {
    mockedFetchUser.mockReturnValue(new Promise(() => {}));
    const { container } = renderUser();
    expect(container.querySelector('.loading-section')).toBeInTheDocument();
    expect(container.querySelector('.profile')).not.toBeInTheDocument();
    expect(mockedFetchUser).toHaveBeenCalledWith('pg', expect.any(AbortSignal));
  });

  it('shows the error message when the request fails', async () => {
    mockedFetchUser.mockRejectedValue(new Error('404'));
    const { container } = renderUser('/user/dang');
    expect(await screen.findByText('Could not load user dang.')).toBeInTheDocument();
    expect(container.querySelector('.loading-section')).not.toBeInTheDocument();
    expect(container.querySelector('.profile')).not.toBeInTheDocument();
  });

  it('renders the user details and about HTML', async () => {
    mockedFetchUser.mockResolvedValue(pg);
    const { container } = renderUser();
    expect(await screen.findByText('Profile: pg')).toBeInTheDocument();
    expect(container.querySelector('.main-details .name')).toHaveTextContent('pg');
    expect(container.querySelector('.main-details .right')).toHaveTextContent('157316 ★');
    expect(container.querySelector('.main-details .age')).toHaveTextContent('Created 19 years ago');
    expect(screen.getByRole('link', { name: 'paulgraham.com' })).toHaveAttribute('href', 'http://paulgraham.com');
    expect(container.querySelector('.other-details pre')).toHaveTextContent('code');
    expect(container.querySelector('.loading-section')).not.toBeInTheDocument();
    expect(container.querySelector('.error-section')).not.toBeInTheDocument();
  });

  it('omits the about section when the user has no about', async () => {
    mockedFetchUser.mockResolvedValue({ ...pg, about: undefined });
    const { container } = renderUser();
    await screen.findByText('Profile: pg');
    expect(container.querySelector('.other-details')).not.toBeInTheDocument();
  });

  it('goes back when the back button is clicked', async () => {
    mockedFetchUser.mockResolvedValue(pg);
    const { container, router } = renderUser();
    await screen.findByText('Profile: pg');
    await router.navigate('/user/pg?from=feed');
    await screen.findByText('/user/pg?from=feed');
    fireEvent.click(container.querySelector('.back-button')!);
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent(/^\/user\/pg$/));
  });

  it('refetches and shows the loader when the id changes, aborting the old request', async () => {
    mockedFetchUser.mockResolvedValueOnce(pg).mockReturnValueOnce(new Promise(() => {}));
    const { container, router } = renderUser();
    await screen.findByText('Profile: pg');
    const firstSignal = mockedFetchUser.mock.calls[0][1]!;
    await router.navigate('/user/dang');
    await waitFor(() => expect(mockedFetchUser).toHaveBeenLastCalledWith('dang', expect.any(AbortSignal)));
    expect(firstSignal.aborted).toBe(true);
    expect(container.querySelector('.loading-section')).toBeInTheDocument();
    expect(container.querySelector('.profile')).not.toBeInTheDocument();
  });

  it('shows the loader, not the old profile, when returning to a user mid-navigation', async () => {
    mockedFetchUser.mockResolvedValueOnce(pg).mockReturnValue(new Promise(() => {}));
    const { container, router } = renderUser();
    await screen.findByText('Profile: pg');
    await router.navigate('/user/dang');
    await waitFor(() => expect(mockedFetchUser).toHaveBeenCalledTimes(2));
    await router.navigate('/user/pg');
    await waitFor(() => expect(mockedFetchUser).toHaveBeenCalledTimes(3));
    expect(container.querySelector('.loading-section')).toBeInTheDocument();
    expect(container.querySelector('.profile')).not.toBeInTheDocument();
  });

  it('sanitizes the about HTML like Angular [innerHTML]', async () => {
    mockedFetchUser.mockResolvedValue({ ...pg, about: '<img src=x onerror="alert(1)"><a href="javascript:alert(2)">x</a>' });
    const { container } = renderUser();
    await screen.findByText('Profile: pg');
    expect(container.querySelector('.other-details p')!.innerHTML).toBe('<a>x</a>');
  });

  it('aborts the request on unmount and does not show an error', () => {
    mockedFetchUser.mockReturnValue(new Promise(() => {}));
    const { unmount } = renderUser();
    const signal = mockedFetchUser.mock.calls[0][1]!;
    unmount();
    expect(signal.aborted).toBe(true);
  });
});
