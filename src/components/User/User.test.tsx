import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { User } from './User';
import { fetchUser } from '../../api/hackernews';
import { makeUser } from '../../test/fixtures';

vi.mock('../../api/hackernews', () => ({
    fetchUser: vi.fn(),
}));

const mockedFetchUser = vi.mocked(fetchUser);

function renderUser(id = 'alice') {
    return render(
        <MemoryRouter initialEntries={['/news/1', `/user/${id}`]} initialIndex={1}>
            <Routes>
                <Route path="/news/1" element={<div>News feed</div>} />
                <Route path="/user/:id" element={<User />} />
            </Routes>
        </MemoryRouter>
    );
}

describe('User', () => {
    beforeEach(() => {
        mockedFetchUser.mockReset();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('shows the loader while loading', () => {
        mockedFetchUser.mockReturnValue(new Promise(() => {}));
        renderUser();
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('shows the error message with the user id when the request fails', async () => {
        mockedFetchUser.mockRejectedValue(new Error('boom'));
        renderUser('bob');
        await waitFor(() => expect(screen.getByText('Could not load user bob.')).toBeInTheDocument());
    });

    it('renders the profile fields and about HTML', async () => {
        mockedFetchUser.mockResolvedValue(
            makeUser({ id: 'alice', karma: 4321, created: '6 years ago', about: '<b>hi there</b>' })
        );
        renderUser('alice');
        await screen.findByText(/6 years ago/);
        expect(screen.getByText('4321 ★')).toBeInTheDocument();
        expect(screen.getByText('Created 6 years ago')).toBeInTheDocument();
        expect(screen.getByText('hi there').tagName).toBe('B');
    });

    it('navigates back when the back button is clicked', async () => {
        mockedFetchUser.mockResolvedValue(makeUser({ id: 'alice' }));
        const { container } = renderUser('alice');
        await screen.findByText('Created 5 years ago');
        fireEvent.click(container.querySelector('.back-button') as HTMLElement);
        expect(await screen.findByText('News feed')).toBeInTheDocument();
    });
});
