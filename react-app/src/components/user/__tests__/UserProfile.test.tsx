import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { UseQueryResult } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { User } from '../../../models/user';
import UserProfile from '../UserProfile';

const useUser = vi.hoisted(() => vi.fn());

vi.mock('../../../hooks/useHackerNews', () => ({ useUser }));

function mockResult(overrides: Partial<UseQueryResult<User, Error>>): UseQueryResult<User, Error> {
    return {
        data: undefined,
        isPending: false,
        isError: false,
        error: null,
        ...overrides,
    } as UseQueryResult<User, Error>;
}

const user: User = {
    id: 'pg',
    created_time: 1160418092,
    created: 'October 9, 2006',
    karma: 155111,
    about: '<pre>Y Combinator</pre>',
};

function renderProfile() {
    return render(
        <MemoryRouter initialEntries={['/user/pg']}>
            <Routes>
                <Route path="/user/:id" element={<UserProfile />} />
            </Routes>
        </MemoryRouter>
    );
}

describe('UserProfile', () => {
    beforeEach(() => {
        useUser.mockReset();
    });

    it('renders the loader while pending', () => {
        useUser.mockReturnValue(mockResult({ isPending: true }));

        const { container } = renderProfile();

        expect(container.querySelector('.loader')).not.toBeNull();
    });

    it('renders an error message when the request fails', () => {
        useUser.mockReturnValue(mockResult({ isError: true, error: new Error('boom') }));

        renderProfile();

        expect(screen.getByText('Could not load user pg.')).toBeInTheDocument();
    });

    it('renders the user details once loaded', () => {
        useUser.mockReturnValue(mockResult({ data: user }));

        const { container } = renderProfile();

        expect(useUser).toHaveBeenCalledWith('pg');
        expect(screen.getByText('Profile: pg')).toBeInTheDocument();
        expect(screen.getByText('pg')).toBeInTheDocument();
        expect(screen.getByText('155111 ★')).toBeInTheDocument();
        expect(screen.getByText('Created October 9, 2006')).toBeInTheDocument();
        expect(container.querySelector('pre')?.textContent).toBe('Y Combinator');
    });
});
