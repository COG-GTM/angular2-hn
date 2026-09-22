import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeUser } from '../test/fixtures';
import { renderWithProviders } from '../test/render';
import { UserPage } from './UserPage';

const { fetchUser } = vi.hoisted(() => ({ fetchUser: vi.fn() }));

vi.mock('../services/hackerNewsApi', () => ({ fetchUser }));

beforeEach(() => {
  fetchUser.mockReset();
});

function renderUser() {
  return renderWithProviders(<UserPage />, { route: '/user/pg', path: '/user/:id' });
}

describe('UserPage', () => {
  it('renders the profile once loaded', async () => {
    fetchUser.mockResolvedValue(makeUser());
    renderUser();

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(await screen.findByText('Profile: pg')).toBeInTheDocument();
    expect(screen.getByText('155111 ★')).toBeInTheDocument();
    expect(screen.getByText('Created October 9, 2006')).toBeInTheDocument();
    expect(screen.getByText('Bug fixer.')).toBeInTheDocument();
    expect(fetchUser).toHaveBeenCalledWith('pg', expect.any(AbortSignal));
  });

  it('renders an error message when the user cannot be loaded', async () => {
    fetchUser.mockRejectedValue(new Error('404'));
    renderUser();

    expect(await screen.findByText('Could not load user pg.')).toBeInTheDocument();
  });
});
