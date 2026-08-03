import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';

import { fetchUser } from '../../shared/api/hackernews-api';
import { makeUser } from '../../test/fixtures';
import { renderWithProviders } from '../../test/renderWithProviders';
import UserPage from './UserPage';

vi.mock('../../shared/api/hackernews-api', () => ({
    fetchUser: vi.fn(),
}));

const navigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>();
    return { ...actual, useNavigate: () => navigate };
});

const fetchUserMock = vi.mocked(fetchUser);

function renderUser(route = '/user/pg') {
    return renderWithProviders(
        <Routes>
            <Route path="/user/:id" element={<UserPage />} />
        </Routes>,
        { route }
    );
}

describe('UserPage', () => {
    beforeEach(() => {
        localStorage.clear();
        navigate.mockReset();
        fetchUserMock.mockReset();
    });

    it('shows the loader, then the profile of the requested user', async () => {
        fetchUserMock.mockResolvedValue(makeUser());

        renderUser();
        expect(screen.getByText('Loading...')).toBeInTheDocument();

        expect(await screen.findByText('Created October 9, 2006')).toBeInTheDocument();
        expect(fetchUserMock).toHaveBeenCalledWith('pg');
        expect(screen.getByText('Profile: pg')).toBeInTheDocument();
        expect(screen.getByText('155111 ★')).toBeInTheDocument();
        expect(screen.getByText('Bug fixer.')).toBeInTheDocument();
    });

    it('omits the about section when the user has none', async () => {
        fetchUserMock.mockResolvedValue(makeUser({ about: '' }));

        const { container } = renderUser();

        await screen.findByText('Created October 9, 2006');
        expect(container.querySelector('.other-details')).toBeNull();
    });

    it('shows an error message naming the user that could not be loaded', async () => {
        fetchUserMock.mockRejectedValue(new Error('not found'));

        renderUser('/user/nobody');

        expect(await screen.findByText('Could not load user nobody.')).toBeInTheDocument();
        await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
    });

    it('navigates back in history from the mobile header', async () => {
        fetchUserMock.mockResolvedValue(makeUser());

        renderUser();
        await screen.findByText('Created October 9, 2006');

        await userEvent.click(screen.getByRole('button', { name: 'Go back' }));

        expect(navigate).toHaveBeenCalledWith(-1);
    });
});
