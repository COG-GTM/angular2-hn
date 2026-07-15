import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { User } from '../models';
import UserPage from './UserPage';

const useUserMock = vi.fn();

vi.mock('../hooks', () => ({
    useUser: (id: string) => useUserMock(id),
}));

function renderAt(id: string) {
    return render(
        <MemoryRouter initialEntries={[`/user/${id}`]}>
            <Routes>
                <Route path="/user/:id" element={<UserPage />} />
            </Routes>
        </MemoryRouter>
    );
}

const baseUser: User = {
    id: 'pg',
    crated_time: 1160418092,
    created: 'October 9, 2006',
    karma: 155111,
    avg: 0,
    about: '',
};

describe('UserPage', () => {
    beforeEach(() => {
        useUserMock.mockReset();
    });

    it('shows the loader while loading', () => {
        useUserMock.mockReturnValue({ user: null, loading: true, error: null });
        renderAt('pg');
        expect(screen.getByText('Loading...')).toBeTruthy();
    });

    it('shows an error message on error', () => {
        useUserMock.mockReturnValue({
            user: null,
            loading: false,
            error: new Error('boom'),
        });
        renderAt('pg');
        expect(screen.getByText('Could not load user pg.')).toBeTruthy();
    });

    it('renders the user profile', () => {
        useUserMock.mockReturnValue({
            user: { ...baseUser, about: '<b>Paul Graham</b>' },
            loading: false,
            error: null,
        });
        renderAt('pg');
        expect(screen.getAllByText('pg').length).toBeGreaterThan(0);
        expect(screen.getByText('155111 ★')).toBeTruthy();
        expect(screen.getByText('Created October 9, 2006')).toBeTruthy();
        expect(screen.getByText('Paul Graham')).toBeTruthy();
    });

    it('does not render the about block when about is empty', () => {
        useUserMock.mockReturnValue({
            user: { ...baseUser, about: '' },
            loading: false,
            error: null,
        });
        const { container } = renderAt('pg');
        expect(container.querySelector('.other-details')).toBeNull();
    });
});
