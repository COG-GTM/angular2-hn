import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router-dom';
import Feed from './Feed';
import { baseUrl } from '../../api/hackerNewsApi';
import { server } from '../../test/server';
import { renderWithProviders } from '../../test/renderWithProviders';
import { mockFeed, mockStory } from '../../test/fixtures';
import type { FeedName } from '../../models';

function renderFeed(feedType: FeedName, page: number) {
    return renderWithProviders(
        <Routes>
            <Route path={`/${feedType}/:page`} element={<Feed feedType={feedType} />} />
        </Routes>,
        { route: `/${feedType}/${page}` }
    );
}

const fullPage = Array.from({ length: 30 }, (_, index) => ({ ...mockStory, id: index + 1 }));

describe('Feed', () => {
    it('shows the loader while the feed is loading', () => {
        server.use(http.get(`${baseUrl}/news`, () => HttpResponse.json(mockFeed)));

        renderFeed('news', 1);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders the fetched stories', async () => {
        server.use(http.get(`${baseUrl}/news`, () => HttpResponse.json(mockFeed)));

        renderFeed('news', 1);

        expect(await screen.findByRole('link', { name: mockStory.title })).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(mockFeed.length);
    });

    it('renders an error message when the request fails', async () => {
        server.use(http.get(`${baseUrl}/news`, () => new HttpResponse(null, { status: 500 })));

        renderFeed('news', 1);

        expect(await screen.findByText('Could not load news stories.')).toBeInTheDocument();
    });

    it('numbers the list from the page offset and renders pagination links', async () => {
        server.use(http.get(`${baseUrl}/news`, () => HttpResponse.json(fullPage)));

        const { container } = renderFeed('news', 2);

        await screen.findByRole('link', { name: 'More ›' });
        expect(container.querySelector('ol')).toHaveAttribute('start', '31');
        expect(screen.getByRole('link', { name: '‹ Prev' })).toHaveAttribute('href', '/news/1');
        expect(screen.getByRole('link', { name: 'More ›' })).toHaveAttribute('href', '/news/3');
    });

    it('hides the prev link on the first page and the more link on a short page', async () => {
        server.use(http.get(`${baseUrl}/news`, () => HttpResponse.json(mockFeed)));

        renderFeed('news', 1);

        await screen.findByRole('link', { name: mockStory.title });
        expect(screen.queryByRole('link', { name: '‹ Prev' })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'More ›' })).not.toBeInTheDocument();
    });

    it('renders the jobs header for the jobs feed', async () => {
        server.use(http.get(`${baseUrl}/jobs`, () => HttpResponse.json(mockFeed)));

        renderFeed('jobs', 1);

        await waitFor(() =>
            expect(screen.getByText(/These are jobs at startups that were funded by Y Combinator/)).toBeInTheDocument()
        );
    });
});
