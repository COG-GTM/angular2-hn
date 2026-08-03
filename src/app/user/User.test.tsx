import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeUser } from '../../test/fixtures';
import { renderWithProviders } from '../../test/renderWithProviders';
import { fetchUser } from '../shared/services/hackernewsApi';
import { User } from './User';

vi.mock('../shared/services/hackernewsApi');

const fetchUserMock = vi.mocked(fetchUser);

function renderUser(id = 'dan') {
  return renderWithProviders(<User />, { route: `/user/${id}`, path: '/user/:id' });
}

beforeEach(() => {
  fetchUserMock.mockReset();
});

describe('User', () => {
  it('shows the loader until the profile arrives', async () => {
    fetchUserMock.mockResolvedValue(makeUser());
    renderUser();

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Loading...')).toBeNull());
  });

  it('requests the user id from the route', async () => {
    fetchUserMock.mockResolvedValue(makeUser({ id: 'pg' }));
    renderUser('pg');

    await waitFor(() => expect(fetchUserMock).toHaveBeenCalledWith('pg', expect.any(AbortSignal)));
  });

  it('renders karma and creation date', async () => {
    fetchUserMock.mockResolvedValue(makeUser());
    renderUser();

    expect(await screen.findByText('1234 ★')).toBeInTheDocument();
    expect(screen.getByText('Created October 25, 2013')).toBeInTheDocument();
    expect(screen.getByText('Profile: dan')).toBeInTheDocument();
  });

  it('renders the about section as html when present', async () => {
    fetchUserMock.mockResolvedValue(makeUser({ about: '<i>Hello</i>' }));
    renderUser();

    expect(await screen.findByText('Hello')).toBeInTheDocument();
  });

  it('omits the about section when the user has none', async () => {
    fetchUserMock.mockResolvedValue(makeUser());
    const { container } = renderUser();

    await screen.findByText('1234 ★');
    expect(container.querySelector('.other-details')).toBeNull();
  });

  it('shows an error message when the profile cannot be loaded', async () => {
    fetchUserMock.mockRejectedValue(new Error('offline'));
    renderUser('ghost');

    expect(await screen.findByText('Could not load user ghost.')).toBeInTheDocument();
  });
});
