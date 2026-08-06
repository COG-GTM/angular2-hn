import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchUser } from '../api/hackerNews';
import { SettingsProvider } from '../context/SettingsContext';
import { User } from '../models/user';
import { stubMatchMedia } from '../testUtils/matchMedia';
import { UserPage } from '../pages/UserPage';

vi.mock('../api/hackerNews', () => ({
    fetchUser: vi.fn(),
}));

const fetchUserMock = vi.mocked(fetchUser);

const user: User = {
    id: 'pg',
    created: '4230 days ago',
    karma: 155000,
    about: '<p>Y Combinator</p><pre>indented</pre>',
};

function renderUserPage(entries: string[] = ['/user/pg'], initialIndex = 0) {
    return render(
        <SettingsProvider>
            <MemoryRouter initialEntries={entries} initialIndex={initialIndex}>
                <Routes>
                    <Route path="/news/:page" element={<p>news feed</p>} />
                    <Route path="/user/:id" element={<UserPage />} />
                </Routes>
            </MemoryRouter>
        </SettingsProvider>
    );
}

describe('UserPage', () => {
    beforeEach(() => {
        stubMatchMedia(false);
        fetchUserMock.mockReset();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        localStorage.clear();
    });

    it('shows the loader until the user has been fetched', async () => {
        fetchUserMock.mockResolvedValue(user);

        const { container } = renderUserPage();

        expect(container.querySelector('.loading-section .loader')).not.toBeNull();
        expect(await screen.findByText('Created 4230 days ago')).toBeInTheDocument();
        expect(container.querySelector('.loading-section')).toBeNull();
    });

    it('renders the profile of the fetched user', async () => {
        fetchUserMock.mockResolvedValue(user);

        const { container } = renderUserPage();

        await screen.findByText('Created 4230 days ago');

        expect(fetchUserMock).toHaveBeenCalledWith('pg');
        expect(screen.getByText('Profile: pg')).toHaveClass('title-block');
        expect(container.querySelector('.mobile.item-header .back-button')).not.toBeNull();
        expect(container.querySelector('.main-details .name')).toHaveTextContent('pg');
        expect(container.querySelector('.main-details .right')).toHaveTextContent('155000 ★');
        expect(container.querySelector('.other-details p')?.innerHTML).toBe('<p>Y Combinator</p><pre>indented</pre>');
    });

    it('omits the about section for a user without an about text', async () => {
        fetchUserMock.mockResolvedValue({ id: 'lurker', created: '2 days ago', karma: 1 });

        const { container } = renderUserPage(['/user/lurker']);

        await screen.findByText('Created 2 days ago');

        expect(container.querySelector('.other-details')).toBeNull();
    });

    it('shows an error message when the user could not be loaded', async () => {
        fetchUserMock.mockRejectedValue(new Error('offline'));

        const { container } = renderUserPage(['/user/ghost']);

        expect(await screen.findByText('Could not load user ghost.')).toBeInTheDocument();
        expect(container.querySelector('.profile')).toBeNull();
        expect(container.querySelector('.loading-section')).toBeNull();
    });

    it('goes back in the history when the back button is clicked', async () => {
        fetchUserMock.mockResolvedValue(user);

        const { container } = renderUserPage(['/news/1', '/user/pg'], 1);

        await screen.findByText('Created 4230 days ago');

        await userEvent.click(container.querySelector('.back-button') as HTMLElement);

        await waitFor(() => expect(screen.getByText('news feed')).toBeInTheDocument());
    });

    it('does not fetch anything when the route carries no user id', () => {
        const { container } = render(
            <SettingsProvider>
                <MemoryRouter initialEntries={['/user']}>
                    <Routes>
                        <Route path="/user" element={<UserPage />} />
                    </Routes>
                </MemoryRouter>
            </SettingsProvider>
        );

        expect(fetchUserMock).not.toHaveBeenCalled();
        expect(container.querySelector('.loading-section')).not.toBeNull();
    });
});
