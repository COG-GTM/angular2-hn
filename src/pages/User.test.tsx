import { beforeEach, describe, expect, it, vi } from 'vitest';

import User from './User';
import { fetchUser } from '../api/hackerNewsApi';
import { user } from '../test/fixtures';
import { renderWithProviders, screen } from '../test/renderWithProviders';

vi.mock('../api/hackerNewsApi', () => ({
    fetchUser: vi.fn(),
}));

const fetchUserMock = vi.mocked(fetchUser);

function renderUser(id = user.id) {
    return renderWithProviders(<User />, {
        initialEntries: [`/user/${id}`],
        routePath: '/user/:id',
    });
}

describe('User', () => {
    beforeEach(() => {
        fetchUserMock.mockReset();
    });

    it('renders the profile returned by the api', async () => {
        fetchUserMock.mockResolvedValue(user);

        renderUser();

        expect(await screen.findByText(`${user.karma} ★`)).toBeInTheDocument();
        expect(screen.getAllByText(user.id).length).toBeGreaterThan(0);
        expect(screen.getByText(`Created ${user.created}`)).toBeInTheDocument();
        expect(screen.getByText('Hello from the test fixture')).toBeInTheDocument();
        expect(fetchUserMock).toHaveBeenCalledWith(user.id);
    });

    it('shows the loader until the profile resolves', () => {
        fetchUserMock.mockReturnValue(new Promise(() => {}));

        renderUser();

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('shows an error message when the api rejects', async () => {
        fetchUserMock.mockRejectedValue(new Error('offline'));

        renderUser('missing');

        expect(await screen.findByText('Could not load user missing.')).toBeInTheDocument();
    });
});
