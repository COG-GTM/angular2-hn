import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import App from './App';
import { baseUrl } from './api/hackerNewsApi';
import { server } from './test/server';
import { renderWithProviders } from './test/renderWithProviders';
import { mockFeed } from './test/fixtures';

describe('App', () => {
    beforeEach(() => {
        server.use(
            http.get(`${baseUrl}/news`, () => HttpResponse.json(mockFeed)),
            http.get(`${baseUrl}/show`, () => HttpResponse.json(mockFeed))
        );
    });

    it('applies the current theme as the top level class', () => {
        localStorage.setItem('theme', 'amoledblack');

        const { container } = renderWithProviders(<App />, { route: '/news/1' });

        expect(container.firstChild).toHaveClass('amoledblack');
    });

    it('renders the header, routed feed and footer', async () => {
        renderWithProviders(<App />, { route: '/news/1' });

        expect(screen.getByRole('link', { name: 'jobs' })).toBeInTheDocument();
        expect(await screen.findByRole('link', { name: mockFeed[0].title })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
    });

    it('sends a Google Analytics pageview on navigation', async () => {
        const ga = vi.fn();
        window.ga = ga;

        renderWithProviders(<App />, { route: '/news/1' });

        expect(ga).toHaveBeenCalledWith('set', 'page', '/news/1');
        expect(ga).toHaveBeenCalledWith('send', 'pageview');

        ga.mockClear();
        await userEvent.click(screen.getByRole('link', { name: 'show' }));

        expect(ga).toHaveBeenCalledWith('set', 'page', '/show/1');
        expect(ga).toHaveBeenCalledWith('send', 'pageview');

        delete window.ga;
    });
});
