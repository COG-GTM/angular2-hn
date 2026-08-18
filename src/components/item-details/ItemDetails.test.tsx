import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router-dom';
import ItemDetails from './ItemDetails';
import { baseUrl } from '../../api/hackerNewsApi';
import { server } from '../../test/server';
import { renderWithProviders } from '../../test/renderWithProviders';
import { mockPollStory, mockStoryWithComments } from '../../test/fixtures';

function renderItem(id: number) {
    return renderWithProviders(
        <Routes>
            <Route path="/item/:id" element={<ItemDetails />} />
            <Route path="/news/1" element={<p>news feed</p>} />
        </Routes>,
        { route: `/item/${id}` }
    );
}

describe('ItemDetails', () => {
    it('shows the loader while the item is loading', () => {
        server.use(http.get(`${baseUrl}/item/:id`, () => HttpResponse.json(mockStoryWithComments)));

        renderItem(mockStoryWithComments.id);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders the item header and its comments', async () => {
        server.use(http.get(`${baseUrl}/item/:id`, () => HttpResponse.json(mockStoryWithComments)));

        renderItem(mockStoryWithComments.id);

        expect(await screen.findAllByRole('link', { name: mockStoryWithComments.title })).toHaveLength(2);
        expect(screen.getByText('A top level comment')).toBeInTheDocument();
        expect(screen.getByText('A nested reply')).toBeInTheDocument();
        expect(screen.getByText('[deleted]')).toBeInTheDocument();
        expect(screen.getAllByRole('link', { name: '5 comments' })).not.toHaveLength(0);
    });

    it('renders an error message when the request fails', async () => {
        server.use(http.get(`${baseUrl}/item/:id`, () => new HttpResponse(null, { status: 500 })));

        renderItem(1);

        expect(await screen.findByText('Could not load item comments.')).toBeInTheDocument();
    });

    it('renders poll results with proportional bars', async () => {
        server.use(
            http.get(`${baseUrl}/item/:id`, ({ params }) => {
                const id = String(params.id);
                if (id === String(mockPollStory.id)) {
                    return HttpResponse.json(mockPollStory);
                }
                return HttpResponse.json({ content: `Option ${id}`, points: id === '301' ? 30 : 10 });
            })
        );

        renderItem(mockPollStory.id);

        expect(await screen.findByText('30 points')).toBeInTheDocument();
        const bars = screen.getAllByTestId('poll-bar');
        expect(bars[0]).toHaveStyle({ width: '75%' });
        expect(bars[1]).toHaveStyle({ width: '25%' });
    });

    it('navigates back when the back button is used', async () => {
        server.use(http.get(`${baseUrl}/item/:id`, () => HttpResponse.json(mockStoryWithComments)));

        renderWithProviders(
            <Routes>
                <Route path="/item/:id" element={<ItemDetails />} />
                <Route path="/news/1" element={<p>news feed</p>} />
            </Routes>,
            { route: `/item/${mockStoryWithComments.id}` }
        );

        await screen.findAllByRole('link', { name: mockStoryWithComments.title });
        await userEvent.click(screen.getByRole('button', { name: 'Go back' }));

        expect(screen.queryByRole('button', { name: 'Go back' })).toBeInTheDocument();
    });
});
