import { screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as api from '../../api/hackernews';
import { makeUser, renderWithProviders } from '../../test/utils';
import UserProfile from './UserProfile';

afterEach(() => vi.restoreAllMocks());

describe('UserProfile', () => {
    it('renders the profile for the routed user', async () => {
        vi.spyOn(api, 'fetchUser').mockResolvedValue(makeUser({ about: '<p>Hello there</p>' }));

        renderWithProviders(<UserProfile />, { route: '/user/alice', path: '/user/:id' });

        expect(await screen.findByText('1234 ★')).toBeInTheDocument();
        expect(screen.getByText('Created June 1, 2017')).toBeInTheDocument();
        expect(screen.getByText('Hello there')).toBeInTheDocument();
        expect(api.fetchUser).toHaveBeenCalledWith('alice', expect.any(AbortSignal));
    });

    it('renders an error message when the request fails', async () => {
        vi.spyOn(api, 'fetchUser').mockRejectedValue(new Error('offline'));

        renderWithProviders(<UserProfile />, { route: '/user/alice', path: '/user/:id' });

        await waitFor(() => expect(screen.getByText('Could not load user alice.')).toBeInTheDocument());
    });
});
