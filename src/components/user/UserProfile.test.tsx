import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchUser } from '../../api/hnApi';
import { makeUser } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import UserProfile from './UserProfile';

vi.mock('../../api/hnApi');

const mockFetchUser = vi.mocked(fetchUser);

function renderAt(route: string) {
    return renderWithProviders(
        <Routes>
            <Route path="/user" element={<UserProfile />} />
            <Route path="/user/:id" element={<UserProfile />} />
        </Routes>,
        { route }
    );
}

beforeEach(() => {
    mockFetchUser.mockReset();
});

describe('UserProfile', () => {
    it('shows the loader while loading', () => {
        mockFetchUser.mockReturnValue(new Promise(() => {}));
        renderAt('/user/pg');
        expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    });

    it('renders the user fields from /user/:id', async () => {
        mockFetchUser.mockResolvedValue(makeUser({ about: 'Bug fixer. <a href="http://paulgraham.com">site</a>' }));
        const { container } = renderAt('/user/pg');
        expect(await screen.findByText('157316 ★')).toBeInTheDocument();
        expect(mockFetchUser).toHaveBeenCalledWith('pg', expect.any(AbortSignal));
        expect(container.querySelector('.main-details .name')).toHaveTextContent('pg');
        expect(screen.getByText('Created 19 years ago')).toBeInTheDocument();
        expect(screen.getByText('Profile: pg')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'site' })).toHaveAttribute('href', 'http://paulgraham.com');
        expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    });

    it('reads the id from ?id= and omits empty about', async () => {
        mockFetchUser.mockResolvedValue(makeUser({ id: 'dang', about: '' }));
        const { container } = renderAt('/user?id=dang');
        expect(await screen.findByText('Profile: dang')).toBeInTheDocument();
        expect(mockFetchUser).toHaveBeenCalledWith('dang', expect.any(AbortSignal));
        expect(container.querySelector('.other-details')).not.toBeInTheDocument();
    });

    it('shows an error when the request fails', async () => {
        mockFetchUser.mockRejectedValue(new Error('404'));
        renderAt('/user/nobody');
        expect(await screen.findByRole('alert')).toHaveTextContent('Could not load user nobody.');
    });

    it('shows an error when no id is given', () => {
        renderAt('/user');
        expect(screen.getByRole('alert')).toHaveTextContent('Could not load user.');
        expect(mockFetchUser).not.toHaveBeenCalled();
    });
});
