import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchUser } from '../api/hackernews-api';
import type { User } from '../models';
import { UserProfile } from './index';

vi.mock('../api/hackernews-api');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>();
    return { ...actual, useNavigate: () => mockNavigate };
});

const mockedFetchUser = vi.mocked(fetchUser);

const sampleUser: User = {
    id: 'pg',
    crated_time: 1160418092,
    created: '17 years ago',
    karma: 155111,
    avg: 0,
    about: 'Bug fixer.',
};

function renderAt(path: string) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route path="/user/:id" element={<UserProfile />} />
            </Routes>
        </MemoryRouter>
    );
}

describe('UserProfile', () => {
    beforeEach(() => {
        mockedFetchUser.mockReset();
        mockNavigate.mockReset();
    });

    it('shows the loader while the user is loading', () => {
        mockedFetchUser.mockReturnValue(new Promise(() => {}));
        const { container } = renderAt('/user/pg');

        expect(container.querySelector('.loader')).not.toBeNull();
        expect(mockedFetchUser).toHaveBeenCalledWith('pg', expect.any(AbortSignal));
    });

    it('shows an error message when the request fails', async () => {
        mockedFetchUser.mockRejectedValue(new Error('boom'));
        renderAt('/user/pg');

        expect(await screen.findByText('Could not load user pg.')).toBeInTheDocument();
        expect(screen.queryByText('Profile: pg')).not.toBeInTheDocument();
    });

    it('renders id, karma and created date', async () => {
        mockedFetchUser.mockResolvedValue(sampleUser);
        const { container } = renderAt('/user/pg');

        expect(await screen.findByText('Profile: pg')).toBeInTheDocument();
        expect(container.querySelector('.main-details .name')).toHaveTextContent('pg');
        expect(container.querySelector('.main-details .right')).toHaveTextContent('155111 ★');
        expect(container.querySelector('.main-details .age')).toHaveTextContent('Created 17 years ago');
        expect(container.querySelector('.profile .mobile.item-header p.title-block .back-button')).not.toBeNull();
    });

    it('renders the about section as HTML', async () => {
        mockedFetchUser.mockResolvedValue({ ...sampleUser, about: 'Hello <b>bio</b>' });
        const { container } = renderAt('/user/pg');

        await screen.findByText('Profile: pg');
        const about = container.querySelector('.other-details p');
        expect(about).not.toBeNull();
        expect(about?.querySelector('b')).toHaveTextContent('bio');
    });

    it('omits the about section when about is empty', async () => {
        mockedFetchUser.mockResolvedValue({ ...sampleUser, about: '' });
        const { container } = renderAt('/user/pg');

        await screen.findByText('Profile: pg');
        expect(container.querySelector('.other-details')).toBeNull();
    });

    it('omits the about section when about is undefined', async () => {
        const { about: _about, ...withoutAbout } = sampleUser;
        void _about;
        mockedFetchUser.mockResolvedValue(withoutAbout as User);
        const { container } = renderAt('/user/pg');

        await screen.findByText('Profile: pg');
        expect(container.querySelector('.other-details')).toBeNull();
    });

    it('navigates back when the back button is clicked', async () => {
        mockedFetchUser.mockResolvedValue(sampleUser);
        const { container } = renderAt('/user/pg');
        await screen.findByText('Profile: pg');

        const backButton = container.querySelector('.back-button');
        expect(backButton).not.toBeNull();
        await userEvent.click(backButton as Element);

        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('refetches when the :id param changes', async () => {
        mockedFetchUser.mockImplementation((id) => Promise.resolve({ ...sampleUser, id }));
        render(
            <MemoryRouter initialEntries={['/user/pg']}>
                <Link to="/user/dang">go to dang</Link>
                <Routes>
                    <Route path="/user/:id" element={<UserProfile />} />
                </Routes>
            </MemoryRouter>
        );
        await screen.findByText('Profile: pg');

        await userEvent.click(screen.getByText('go to dang'));

        expect(await screen.findByText('Profile: dang')).toBeInTheDocument();
        expect(mockedFetchUser).toHaveBeenCalledTimes(2);
        expect(mockedFetchUser).toHaveBeenLastCalledWith('dang', expect.any(AbortSignal));
    });

    it('ignores results and errors after the request is aborted', async () => {
        let resolve: (user: User) => void = () => {};
        mockedFetchUser.mockImplementation(
            (_id, signal) =>
                new Promise<User>((res, rej) => {
                    resolve = res;
                    signal?.addEventListener('abort', () => rej(new Error('aborted')));
                })
        );
        const { unmount, container } = renderAt('/user/pg');
        expect(container.querySelector('.loader')).not.toBeNull();

        const signal = mockedFetchUser.mock.calls[0][1];
        unmount();
        expect(signal?.aborted).toBe(true);
        resolve(sampleUser);

        await waitFor(() => expect(screen.queryByText('Profile: pg')).not.toBeInTheDocument());
        expect(screen.queryByText('Could not load user pg.')).not.toBeInTheDocument();
    });
});
