import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router-dom';
import UserProfile from './UserProfile';
import { baseUrl } from '../../api/hackerNewsApi';
import { server } from '../../test/server';
import { renderWithProviders } from '../../test/renderWithProviders';
import { mockUser } from '../../test/fixtures';

function renderUser(id: string) {
    return renderWithProviders(
        <Routes>
            <Route path="/user/:id" element={<UserProfile />} />
        </Routes>,
        { route: `/user/${id}` }
    );
}

describe('UserProfile', () => {
    it('shows the loader while the profile is loading', () => {
        server.use(http.get(`${baseUrl}/user/:id`, () => HttpResponse.json(mockUser)));

        renderUser(mockUser.id);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders the user profile', async () => {
        server.use(http.get(`${baseUrl}/user/:id`, () => HttpResponse.json(mockUser)));

        renderUser(mockUser.id);

        expect(await screen.findByText(`Profile: ${mockUser.id}`)).toBeInTheDocument();
        expect(screen.getByText('1234 ★')).toBeInTheDocument();
        expect(screen.getByText('Created 5 years ago')).toBeInTheDocument();
        expect(screen.getByText('Hello there')).toBeInTheDocument();
    });

    it('renders an error message when the request fails', async () => {
        server.use(http.get(`${baseUrl}/user/:id`, () => new HttpResponse(null, { status: 404 })));

        renderUser('nobody');

        expect(await screen.findByText('Could not load user nobody.')).toBeInTheDocument();
    });
});
