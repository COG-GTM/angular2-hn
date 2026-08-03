import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as api from '../../services/hackernewsApi';
import { makeUser } from '../../test/fixtures';
import { renderWithProviders } from '../../test/renderWithProviders';
import { User } from './User';

describe('User', () => {
    beforeEach(() => {
        vi.spyOn(api, 'fetchUser').mockResolvedValue(makeUser());
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('shows the loader while the profile is fetched', async () => {
        renderWithProviders(<User />, { route: '/user/alice', path: '/user/:id' });

        expect(screen.getByText('Loading...')).toBeInTheDocument();
        await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
    });

    it('renders the profile details', async () => {
        renderWithProviders(<User />, { route: '/user/alice', path: '/user/:id' });

        expect(await screen.findByText('1234 ★')).toBeInTheDocument();
        expect(screen.getAllByText('alice').length).toBeGreaterThan(0);
        expect(screen.getByText('Created 5 years ago')).toBeInTheDocument();
        expect(api.fetchUser).toHaveBeenCalledWith('alice', expect.any(AbortSignal));
    });

    it('renders the about section as html when present', async () => {
        vi.spyOn(api, 'fetchUser').mockResolvedValue(makeUser({ about: '<i>Hello there</i>' }));

        renderWithProviders(<User />, { route: '/user/alice', path: '/user/:id' });

        expect(await screen.findByText('Hello there')).toBeInTheDocument();
    });

    it('omits the about section when the user has no bio', async () => {
        renderWithProviders(<User />, { route: '/user/alice', path: '/user/:id' });

        await screen.findByText('1234 ★');
        expect(document.querySelector('.other-details')).toBeNull();
    });

    it('shows a user specific error message when the request fails', async () => {
        vi.spyOn(api, 'fetchUser').mockRejectedValue(new Error('offline'));

        renderWithProviders(<User />, { route: '/user/ghost', path: '/user/:id' });

        expect(await screen.findByText('Could not load user ghost.')).toBeInTheDocument();
    });

    it('goes back in history from the mobile back button', async () => {
        renderWithProviders(<User />, { route: '/user/alice', path: '/user/:id' });

        await screen.findByText('1234 ★');
        await userEvent.click(screen.getByRole('button', { name: 'Go back' }));

        expect(screen.getByRole('button', { name: 'Go back' })).toBeInTheDocument();
    });
});
