import { screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import { User as UserModel } from '../shared/models';
import { fetchUser } from '../shared/services/hackernews-api';
import { renderWithProviders } from '../test-utils';
import User from './User';

jest.mock('../shared/services/hackernews-api', () => ({
    ...jest.requireActual('../shared/services/hackernews-api'),
    fetchUser: jest.fn(),
}));

const fetchUserMock = fetchUser as jest.MockedFunction<typeof fetchUser>;

const profile: UserModel = {
    id: 'pg',
    crated_time: 1160418092,
    created: 'October 9, 2006',
    karma: 155111,
    avg: 6,
    about: '<p>Bug fixer.</p>',
};

function renderUser() {
    return renderWithProviders(
        <Routes>
            <Route path="/user/:id" element={<User />} />
        </Routes>,
        { route: '/user/pg' }
    );
}

beforeEach(() => {
    fetchUserMock.mockReset();
});

describe('User', () => {
    it('shows the loader and then the profile', async () => {
        fetchUserMock.mockResolvedValue(profile);

        const { container } = renderUser();

        expect(screen.getByText('Loading...')).toBeInTheDocument();

        expect(await screen.findByText('Created October 9, 2006')).toBeInTheDocument();
        expect(screen.getAllByText('pg')).not.toHaveLength(0);
        expect(screen.getByText('155111 ★')).toBeInTheDocument();
        expect(container.querySelector('.other-details')).toHaveTextContent('Bug fixer.');
        expect(fetchUserMock).toHaveBeenCalledWith('pg', expect.any(AbortSignal));
    });

    it('shows an error message when the user cannot be loaded', async () => {
        fetchUserMock.mockRejectedValue(new Error('boom'));

        renderUser();

        expect(await screen.findByText('Could not load user pg.')).toBeInTheDocument();
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('ignores aborted requests', async () => {
        fetchUserMock.mockRejectedValue(new DOMException('Aborted', 'AbortError'));

        renderUser();

        await waitFor(() => expect(fetchUserMock).toHaveBeenCalled());

        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(screen.queryByText('Could not load user pg.')).not.toBeInTheDocument();
    });
});
