import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

import ItemDetailsPage from './ItemDetailsPage';
import * as api from '../../api/hackerNewsApi';
import { makeComment, makeStory } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';

vi.mock('../../api/hackerNewsApi');

const fetchItemContent = vi.mocked(api.fetchItemContent);

beforeEach(() => {
    fetchItemContent.mockReset();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

function renderItem(route = '/item/100') {
    return renderWithProviders(
        <Routes>
            <Route path="/item/:id" element={<ItemDetailsPage />} />
            <Route path="/news/:page" element={<p>News feed</p>} />
        </Routes>,
        { route }
    );
}

describe('ItemDetailsPage', () => {
    it('loads the item from the route id', async () => {
        fetchItemContent.mockResolvedValue(makeStory({ id: 4242, title: 'Deep dive' }));

        renderItem('/item/4242');

        await waitFor(() => expect(fetchItemContent).toHaveBeenCalledWith(4242, expect.any(AbortSignal)));
        expect(await screen.findAllByRole('link', { name: 'Deep dive' })).toHaveLength(2);
    });

    it('shows the loader first and scrolls to the top', async () => {
        fetchItemContent.mockResolvedValue(makeStory());

        const { container } = renderItem();

        expect(container.querySelector('.loader')).toBeInTheDocument();
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
        await screen.findAllByRole('link', { name: 'A linked story' });
    });

    it('shows an error when the item cannot be loaded', async () => {
        fetchItemContent.mockRejectedValue(new Error('offline'));

        renderItem();

        expect(await screen.findByText('Could not load item comments.')).toBeInTheDocument();
    });

    it('renders the story text and its comment thread', async () => {
        fetchItemContent.mockResolvedValue(
            makeStory({
                content: '<p>The submitted text</p>',
                comments: [makeComment({ id: 1, content: '<p>First</p>' }), makeComment({ id: 2, user: 'dang' })],
            })
        );

        renderItem();

        expect(await screen.findByText('The submitted text')).toBeInTheDocument();
        expect(screen.getByText('First')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'dang' })).toBeInTheDocument();
    });

    it('renders poll options with a bar sized by their share of the votes', async () => {
        fetchItemContent.mockResolvedValue(
            makeStory({
                type: 'poll',
                poll: [
                    { points: 75, content: 'Yes' },
                    { points: 25, content: 'No' },
                ],
                poll_votes_count: 100,
            })
        );

        const { container } = renderItem();

        expect(await screen.findByText('Yes')).toBeInTheDocument();
        expect(screen.getByText('75 points')).toBeInTheDocument();

        const bars = container.querySelectorAll('.pollBar');

        expect(bars[0]).toHaveStyle({ width: '75%' });
        expect(bars[1]).toHaveStyle({ width: '25%' });
    });

    it('does not render poll results for ordinary stories', async () => {
        fetchItemContent.mockResolvedValue(makeStory());

        const { container } = renderItem();

        await screen.findAllByRole('link', { name: 'A linked story' });
        expect(container.querySelector('.pollResults')).not.toBeInTheDocument();
    });

    it('links a self post back to its own page and an external story to its url', async () => {
        fetchItemContent.mockResolvedValue(makeStory({ url: 'item?id=100', title: 'Ask HN' }));

        const { unmount } = renderItem();

        expect((await screen.findAllByRole('link', { name: 'Ask HN' }))[0]).toHaveAttribute('href', '/item/100');
        unmount();

        fetchItemContent.mockResolvedValue(makeStory());
        renderItem();

        expect((await screen.findAllByRole('link', { name: 'A linked story' }))[0]).toHaveAttribute(
            'href',
            'https://example.com/post'
        );
    });

    it('goes back in history from the mobile back button', async () => {
        fetchItemContent.mockResolvedValue(makeStory());

        const { container } = renderWithProviders(
            <Routes>
                <Route path="/item/:id" element={<ItemDetailsPage />} />
                <Route path="/news/:page" element={<p>News feed</p>} />
            </Routes>,
            { history: ['/news/1', '/item/100'] }
        );

        await screen.findAllByRole('link', { name: 'A linked story' });
        await userEvent.click(container.querySelector('.back-button') as Element);

        expect(await screen.findByText('News feed')).toBeInTheDocument();
    });
});
