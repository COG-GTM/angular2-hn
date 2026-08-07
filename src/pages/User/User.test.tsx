import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import User from './User';
import { User as UserModel } from '../../models/user';
import { fetchUser } from '../../api/hackernews';
import { renderWithProviders, stubMatchMedia } from '../../testUtils';

vi.mock('../../api/hackernews', () => ({
    fetchUser: vi.fn(),
}));

const fetchUserMock = vi.mocked(fetchUser);

function makeUser(overrides: Partial<UserModel> = {}): UserModel {
    return {
        id: 'pg',
        created: '5 years ago',
        karma: 1234,
        about: '<p>Founder</p>',
        ...overrides,
    } as unknown as UserModel;
}

function renderUser(id = 'pg') {
    return renderWithProviders(<User />, { path: '/user/:id', route: `/user/${id}` });
}

describe('User', () => {
    beforeEach(() => {
        localStorage.clear();
        stubMatchMedia();
        fetchUserMock.mockReset();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('shows the loader until the profile resolves and fetches the route id', async () => {
        fetchUserMock.mockResolvedValue(makeUser({ id: 'kate' }));

        renderUser('kate');
        expect(screen.getByText('Loading...')).toBeInTheDocument();

        await waitFor(() => expect(screen.getByText('Created 5 years ago')).toBeInTheDocument());
        expect(fetchUserMock).toHaveBeenCalledWith('kate');
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('renders the profile details and the about HTML', async () => {
        fetchUserMock.mockResolvedValue(makeUser());

        const { container } = renderUser();

        await waitFor(() => expect(screen.getByText('1234 ★')).toBeInTheDocument());
        expect(screen.getByText('Profile: pg')).toBeInTheDocument();
        expect(screen.getByText('pg')).toHaveClass('name');
        expect(container.querySelector('.other-details p')?.innerHTML).toBe('<p>Founder</p>');
    });

    it('omits the about section when the profile has none', async () => {
        fetchUserMock.mockResolvedValue(makeUser({ about: undefined }));

        const { container } = renderUser();

        await waitFor(() => expect(screen.getByText('1234 ★')).toBeInTheDocument());
        expect(container.querySelector('.other-details')).not.toBeInTheDocument();
    });

    it('renders the error message with the requested id when the request fails', async () => {
        fetchUserMock.mockRejectedValue(new Error('offline'));

        renderUser('missing');

        await waitFor(() => expect(screen.getByText('Could not load user missing.')).toBeInTheDocument());
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('goes back in history when the mobile back button is clicked', async () => {
        fetchUserMock.mockResolvedValue(makeUser());

        const { container, router } = renderUser();
        await waitFor(() => expect(container.querySelector('.back-button')).toBeInTheDocument());

        const navigateSpy = vi.spyOn(router, 'navigate');
        await userEvent.click(container.querySelector('.back-button') as HTMLElement);

        expect(navigateSpy).toHaveBeenCalledWith(-1);
    });
});
