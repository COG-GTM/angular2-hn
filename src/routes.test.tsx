import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import AppRoutes from './routes';
import { baseUrl } from './api/hackerNewsApi';
import { server } from './test/server';
import { renderWithProviders } from './test/renderWithProviders';
import { mockFeed, mockStoryWithComments, mockUser } from './test/fixtures';

describe('routes', () => {
    it('redirects the root path to the news feed', async () => {
        server.use(http.get(`${baseUrl}/news`, () => HttpResponse.json(mockFeed)));

        renderWithProviders(<AppRoutes />, { route: '/' });

        expect(await screen.findByRole('link', { name: mockFeed[0].title })).toBeInTheDocument();
    });

    it.each(['news', 'newest', 'show', 'ask', 'jobs'])('renders the %s feed', async (feedType) => {
        server.use(http.get(`${baseUrl}/${feedType}`, () => HttpResponse.json(mockFeed)));

        renderWithProviders(<AppRoutes />, { route: `/${feedType}/1` });

        expect(await screen.findByRole('link', { name: mockFeed[0].title })).toBeInTheDocument();
    });

    it('lazily renders the item details route', async () => {
        server.use(http.get(`${baseUrl}/item/:id`, () => HttpResponse.json(mockStoryWithComments)));

        renderWithProviders(<AppRoutes />, { route: `/item/${mockStoryWithComments.id}` });

        expect(await screen.findByText('A top level comment')).toBeInTheDocument();
    });

    it('lazily renders the user route', async () => {
        server.use(http.get(`${baseUrl}/user/:id`, () => HttpResponse.json(mockUser)));

        renderWithProviders(<AppRoutes />, { route: `/user/${mockUser.id}` });

        expect(await screen.findByText(`Profile: ${mockUser.id}`)).toBeInTheDocument();
    });
});
