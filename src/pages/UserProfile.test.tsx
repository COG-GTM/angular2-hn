import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UserProfile } from './UserProfile';
import * as api from '../services/hackernewsApi';
import type { User } from '../models';

const user: User = {
    id: 'pg',
    created: '5 years ago',
    karma: 155000,
    about: 'Bug fixer &amp; <i>essayist</i>',
};

const navigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
    return { ...actual, useNavigate: () => navigate };
});

function renderProfile(id = 'pg') {
    return render(
        <MemoryRouter initialEntries={[`/user/${id}`]}>
            <Routes>
                <Route path="/user/:id" element={<UserProfile />} />
            </Routes>
        </MemoryRouter>,
    );
}

describe('UserProfile', () => {
    beforeEach(() => {
        navigate.mockClear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('shows the loader while the user is being fetched', () => {
        vi.spyOn(api, 'fetchUser').mockReturnValue(new Promise(() => {}));
        const { container } = renderProfile();
        expect(container.querySelector('.loading-section .loader')).toBeInTheDocument();
    });

    it('renders the user profile once loaded', async () => {
        const fetchUser = vi.spyOn(api, 'fetchUser').mockResolvedValue(user);
        const { container } = renderProfile();

        expect(await screen.findByText('Profile: pg')).toBeInTheDocument();
        expect(fetchUser).toHaveBeenCalledWith('pg', expect.any(AbortSignal));
        expect(container.querySelector('.profile .main-details .name')).toHaveTextContent('pg');
        expect(container.querySelector('.main-details .right')).toHaveTextContent('155000 ★');
        expect(container.querySelector('.main-details .age')).toHaveTextContent('Created 5 years ago');
        expect(container.querySelector('.other-details p')?.innerHTML).toBe(
            'Bug fixer &amp; <i>essayist</i>',
        );
    });

    it('omits the other-details block when the user has no about text', async () => {
        vi.spyOn(api, 'fetchUser').mockResolvedValue({ ...user, about: undefined });
        const { container } = renderProfile();

        await screen.findByText('Profile: pg');
        expect(container.querySelector('.other-details')).toBeNull();
    });

    it('navigates back when the back button is clicked', async () => {
        vi.spyOn(api, 'fetchUser').mockResolvedValue(user);
        const { container } = renderProfile();

        await screen.findByText('Profile: pg');
        await userEvent.click(container.querySelector('.back-button') as HTMLElement);
        expect(navigate).toHaveBeenCalledWith(-1);
    });

    it('shows an error message when the request fails', async () => {
        vi.spyOn(api, 'fetchUser').mockRejectedValue(new Error('boom'));
        renderProfile('missing');

        expect(await screen.findByText('Could not load user missing.')).toBeInTheDocument();
    });

    it('aborts the in-flight request on unmount', async () => {
        let capturedSignal: AbortSignal | undefined;
        vi.spyOn(api, 'fetchUser').mockImplementation((_id, signal) => {
            capturedSignal = signal;
            return new Promise(() => {});
        });
        const { unmount } = renderProfile();
        unmount();

        await waitFor(() => expect(capturedSignal?.aborted).toBe(true));
    });
});
