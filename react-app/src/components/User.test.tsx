import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';

import User from './User';
import { renderWithProviders } from '../test/test-utils';
import * as hnApi from '../api/hnApi';

vi.mock('../api/hnApi');

describe('User', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders the user profile with karma, created date and about', async () => {
    vi.mocked(hnApi.fetchUser).mockResolvedValue({
      id: 'pg',
      crated_time: 0,
      created: 'January 1, 2007',
      karma: 155000,
      avg: 0,
      about: '<p>Founder of Y Combinator</p>',
    });
    renderWithProviders(<User />, { route: '/user/pg', path: '/user/:id' });

    await waitFor(() => expect(screen.getByText('Founder of Y Combinator')).toBeInTheDocument());
    expect(screen.getByText('pg')).toBeInTheDocument();
    expect(screen.getByText('155000 ★')).toBeInTheDocument();
    expect(screen.getByText('Created January 1, 2007')).toBeInTheDocument();
    expect(hnApi.fetchUser).toHaveBeenCalledWith('pg');
  });

  it('renders an error message when the fetch fails', async () => {
    vi.mocked(hnApi.fetchUser).mockRejectedValue(new Error('boom'));
    renderWithProviders(<User />, { route: '/user/ghost', path: '/user/:id' });

    await waitFor(() =>
      expect(screen.getByText('Could not load user ghost.')).toBeInTheDocument()
    );
  });
});
