import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

import UserPage from './UserPage';
import * as api from '../../api/hackerNewsApi';
import { makeUser } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';

vi.mock('../../api/hackerNewsApi');

const fetchUser = vi.mocked(api.fetchUser);

beforeEach(() => {
    fetchUser.mockReset();
});

function renderUser(history: string[]) {
    return renderWithProviders(
        <Routes>
            <Route path="/user/:id" element={<UserPage />} />
            <Route path="/news/:page" element={<p>News feed</p>} />
        </Routes>,
        { history }
    );
}

describe('UserPage', () => {
    it('loads the profile named in the route', async () => {
        fetchUser.mockResolvedValue(makeUser());

        renderUser(['/user/pg']);

        await waitFor(() => expect(fetchUser).toHaveBeenCalledWith('pg', expect.any(AbortSignal)));
        expect(await screen.findByText('Profile: pg')).toBeInTheDocument();
    });

    it('shows karma, creation date and the about html', async () => {
        fetchUser.mockResolvedValue(makeUser());

        renderUser(['/user/pg']);

        expect(await screen.findByText('155000 ★')).toBeInTheDocument();
        expect(screen.getByText('Created October 2006')).toBeInTheDocument();
        expect(screen.getByText('Bug fixer.')).toBeInTheDocument();
    });

    it('omits the about block when the profile has none', async () => {
        fetchUser.mockResolvedValue(makeUser({ about: '' }));

        const { container } = renderUser(['/user/pg']);

        await screen.findByText('Created October 2006');
        expect(container.querySelector('.other-details')).not.toBeInTheDocument();
    });

    it('shows the loader until the profile arrives', async () => {
        fetchUser.mockResolvedValue(makeUser());

        const { container } = renderUser(['/user/pg']);

        expect(container.querySelector('.loader')).toBeInTheDocument();
        await screen.findByText('Profile: pg');
    });

    it('names the user in the error message when the request fails', async () => {
        fetchUser.mockRejectedValue(new Error('offline'));

        renderUser(['/user/nobody']);

        expect(await screen.findByText('Could not load user nobody.')).toBeInTheDocument();
    });

    it('goes back in history from the mobile back button', async () => {
        fetchUser.mockResolvedValue(makeUser());

        const { container } = renderUser(['/news/1', '/user/pg']);

        await screen.findByText('Profile: pg');
        await userEvent.click(container.querySelector('.back-button') as Element);

        expect(await screen.findByText('News feed')).toBeInTheDocument();
    });
});
