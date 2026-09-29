import { screen } from '@testing-library/react';

import { user } from '../../test/fixtures';
import { mockFetch, renderWithProviders } from '../../test/utils';
import { USER_API_BASE_URL } from '../shared/services/hackernewsApi';
import { User } from './User';

function renderUser(id: string) {
  return renderWithProviders(<User />, { route: `/user/${id}`, path: '/user/:id' });
}

describe('User', () => {
  it('renders the profile', async () => {
    mockFetch({ [`${USER_API_BASE_URL}/user/pg.json`]: user });
    renderUser('pg');

    expect(await screen.findByText('Profile: pg')).toBeInTheDocument();
    expect(screen.getByText('157316 ★')).toBeInTheDocument();
    expect(screen.getByText('Created 20 years ago')).toBeInTheDocument();
    expect(screen.getByText('Bug fixer.')).toBeInTheDocument();
  });

  it('shows an error when the user cannot be loaded', async () => {
    mockFetch({ [`${USER_API_BASE_URL}/user/nobody.json`]: null });
    renderUser('nobody');
    expect(await screen.findByText('Could not load user nobody.')).toBeInTheDocument();
  });
});
