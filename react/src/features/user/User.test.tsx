import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { User } from './User';
import { fetchUser } from '../../api/hackernews';
import { User as UserModel } from '../../models/user';

vi.mock('../../api/hackernews', () => ({
  fetchUser: vi.fn(),
}));

const mockedFetchUser = vi.mocked(fetchUser);

const user: UserModel = {
  id: 'someid',
  crated_time: 1234567890,
  created: '10 years ago',
  karma: 42,
  avg: 1,
  about: '<i>hello</i>',
};

function renderUser(id = 'someid') {
  return render(
    <MemoryRouter initialEntries={[`/user/${id}`]}>
      <Routes>
        <Route path="/user/:id" element={<User />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('User', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders the loaded profile', async () => {
    mockedFetchUser.mockResolvedValue(user);

    renderUser();

    expect(await screen.findByText('Profile: someid')).toBeInTheDocument();
    expect(screen.getByText('42 ★')).toBeInTheDocument();
    expect(screen.getByText('Created 10 years ago')).toBeInTheDocument();
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('renders an error message when the fetch fails', async () => {
    mockedFetchUser.mockRejectedValue(new Error('boom'));

    renderUser();

    expect(await screen.findByText('Could not load user someid.')).toBeInTheDocument();
  });
});
