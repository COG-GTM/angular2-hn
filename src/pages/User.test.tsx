import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { User as UserModel } from '../models/user';
import User from './User';

function stubFetch(user: UserModel | null) {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => {
        if (!user) {
            return { ok: false, status: 404 } as Response;
        }
        return { ok: true, status: 200, json: async () => user } as Response;
    });

    vi.stubGlobal('fetch', fetchMock);

    return fetchMock;
}

function renderUser() {
    return render(
        <MemoryRouter initialEntries={['/user/pg']}>
            <Routes>
                <Route path="user/:id" element={<User />} />
            </Routes>
        </MemoryRouter>
    );
}

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

describe('User', () => {
    it('renders the profile of the routed user', async () => {
        const fetchMock = stubFetch({
            id: 'pg',
            crated_time: 0,
            created: 'January 1, 2007',
            karma: 155000,
            avg: 0,
            about: '<pre>Bio</pre>',
        });
        const { container } = renderUser();

        expect(fetchMock.mock.calls[0][0]).toBe('https://node-hnapi.herokuapp.com/user/pg');

        await waitFor(() => expect(screen.getByText('155000 ★')).toBeTruthy());
        expect(screen.getByText('Created January 1, 2007')).toBeTruthy();
        expect(container.querySelector('.other-details')?.innerHTML).toContain('<pre>Bio</pre>');
    });

    it('omits the about block when the user has no bio', async () => {
        stubFetch({ id: 'pg', crated_time: 0, created: 'January 1, 2007', karma: 1, avg: 0, about: '' });
        const { container } = renderUser();

        await waitFor(() => expect(screen.getByText('1 ★')).toBeTruthy());
        expect(container.querySelector('.other-details')).toBeNull();
    });

    it('names the user in the error message', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        stubFetch(null);
        renderUser();

        await waitFor(() => expect(screen.getByText('Could not load user pg.')).toBeTruthy());
    });
});
