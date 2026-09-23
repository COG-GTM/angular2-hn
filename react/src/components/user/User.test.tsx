import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AsyncState } from '../../api/hooks';
import type { User as UserModel } from '../../models';
import { User } from './User';

const useUser = vi.hoisted(() => vi.fn());
const navigate = vi.hoisted(() => vi.fn());

vi.mock('../../api/hooks', () => ({ useUser }));
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
    return { ...actual, useNavigate: () => navigate };
});

const pg: UserModel = {
    id: 'pg',
    created_time: 1160418092,
    created: 'October 9, 2006',
    karma: 155111,
    avg: 6.9,
    about: 'Bug fixer. <a href="http://paulgraham.com">Essays</a>',
};

function state(partial: Partial<AsyncState<UserModel>>): AsyncState<UserModel> {
    return { data: null, loading: false, error: null, ...partial };
}

function renderUser(id = 'pg') {
    return render(
        <MemoryRouter initialEntries={[`/user/${id}`]}>
            <Routes>
                <Route path="/user/:id" element={<User />} />
            </Routes>
        </MemoryRouter>
    );
}

describe('User', () => {
    beforeEach(() => {
        useUser.mockReset();
        navigate.mockReset();
    });

    it('fetches the user id taken from the route, as the Angular route params subscription did', () => {
        useUser.mockReturnValue(state({ loading: true }));

        renderUser('jl');

        expect(useUser).toHaveBeenCalledWith('jl');
    });

    it('renders the loader while no user and no error, as *ngIf="!user && !errorMessage" did', () => {
        useUser.mockReturnValue(state({ loading: true }));

        const { container } = renderUser();

        expect(container.querySelector('.loading-section')).toBeInTheDocument();
        expect(container.querySelector('.profile')).not.toBeInTheDocument();
    });

    it('renders the Angular error message when the fetch fails', () => {
        useUser.mockReturnValue(state({ error: 'Network error' }));

        const { container } = renderUser('nobody');

        expect(screen.getByText('Could not load user nobody.')).toBeInTheDocument();
        expect(container.querySelector('.profile')).not.toBeInTheDocument();
    });

    it('renders the profile header, karma, created date and about html', () => {
        useUser.mockReturnValue(state({ data: pg }));

        const { container } = renderUser();

        expect(container.querySelector('.title-block')).toHaveTextContent('Profile: pg');
        expect(container.querySelector('.main-details .name')).toHaveTextContent('pg');
        expect(container.querySelector('.main-details .right')).toHaveTextContent('155111 ★');
        expect(container.querySelector('.main-details .age')).toHaveTextContent('Created October 9, 2006');
        expect(container.querySelector('.other-details a')).toHaveAttribute('href', 'http://paulgraham.com');
    });

    it('omits the about block when the user has no about text, as *ngIf="user.about" did', () => {
        useUser.mockReturnValue(state({ data: { ...pg, about: '' } }));

        const { container } = renderUser();

        expect(container.querySelector('.other-details')).not.toBeInTheDocument();
    });

    it('goes back in history when the back button is clicked, as goBack() did', async () => {
        useUser.mockReturnValue(state({ data: pg }));

        const { container } = renderUser();
        await userEvent.click(container.querySelector('.back-button') as HTMLElement);

        expect(navigate).toHaveBeenCalledWith(-1);
    });
});
