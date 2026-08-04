import { screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import { Story } from '../shared/models';
import { fetchItemContent } from '../shared/services/hackernews-api';
import { renderWithProviders } from '../test-utils';
import ItemDetails from './ItemDetails';

jest.mock('../shared/services/hackernews-api', () => ({
    ...jest.requireActual('../shared/services/hackernews-api'),
    fetchItemContent: jest.fn(),
}));

const fetchItemContentMock = fetchItemContent as jest.MockedFunction<typeof fetchItemContent>;

const story: Story = {
    id: 42,
    title: 'A React story',
    points: 128,
    user: 'pg',
    time: 1600000000,
    time_ago: '2 hours ago',
    type: 'story',
    url: 'https://example.com/story',
    domain: 'example.com',
    comments_count: 1,
    content: '<p>The story text</p>',
    comments: [
        {
            id: 1,
            level: 0,
            user: 'root-user',
            time: 1,
            time_ago: '1 hour ago',
            content: '<p>A root comment</p>',
            comments: [
                {
                    id: 2,
                    level: 1,
                    user: 'child-user',
                    time: 2,
                    time_ago: '30 minutes ago',
                    content: '<p>A nested reply</p>',
                },
            ],
        },
    ],
};

const poll: Story = {
    id: 43,
    title: 'A poll',
    points: 10,
    user: 'pg',
    time: 1600000000,
    time_ago: '3 hours ago',
    type: 'poll',
    comments_count: 0,
    poll: [
        { content: '<p>Option A</p>', points: 30 },
        { content: '<p>Option B</p>', points: 10 },
    ],
    poll_votes_count: 40,
};

function renderItemDetails(id: number) {
    return renderWithProviders(
        <Routes>
            <Route path="/item/:id" element={<ItemDetails />} />
        </Routes>,
        { route: `/item/${id}` }
    );
}

beforeEach(() => {
    fetchItemContentMock.mockReset();
    localStorage.clear();
    window.scrollTo = jest.fn();
});

describe('ItemDetails', () => {
    it('shows the loader and then the item with its comments', async () => {
        fetchItemContentMock.mockResolvedValue(story);

        const { container } = renderItemDetails(42);

        expect(screen.getByText('Loading...')).toBeInTheDocument();

        expect(await screen.findAllByRole('link', { name: story.title })).toHaveLength(2);
        expect(screen.getAllByRole('link', { name: story.title })[0]).toHaveAttribute('href', story.url);
        expect(screen.getByText('(example.com)')).toBeInTheDocument();
        expect(screen.getByText(/128 points by/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: '1 comment' })).toBeInTheDocument();
        expect(container.querySelector('.subject')).toHaveTextContent('The story text');
        expect(screen.getByText('A root comment')).toBeInTheDocument();
        expect(screen.getByText('A nested reply')).toBeInTheDocument();
        expect(fetchItemContentMock).toHaveBeenCalledWith(42, expect.any(AbortSignal));
    });

    it('shows an error message when the item cannot be loaded', async () => {
        fetchItemContentMock.mockRejectedValue(new Error('boom'));

        renderItemDetails(42);

        expect(await screen.findByText('Could not load item comments.')).toBeInTheDocument();
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('ignores aborted requests', async () => {
        fetchItemContentMock.mockRejectedValue(new DOMException('Aborted', 'AbortError'));

        renderItemDetails(42);

        await waitFor(() => expect(fetchItemContentMock).toHaveBeenCalled());

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('opens the title in a new tab when the setting is enabled', async () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        fetchItemContentMock.mockResolvedValue(story);

        renderItemDetails(42);

        const titles = await screen.findAllByRole('link', { name: story.title });

        expect(titles[0]).toHaveAttribute('target', '_blank');
        expect(titles[0]).toHaveAttribute('rel', 'noopener');
    });

    it('renders the poll results with their bars', async () => {
        fetchItemContentMock.mockResolvedValue(poll);

        const { container } = renderItemDetails(43);

        await waitFor(() => expect(container.querySelector('.pollResults')).toBeInTheDocument());

        expect(screen.getByText('Option A')).toBeInTheDocument();
        expect(screen.getByText('30 points')).toBeInTheDocument();
        expect(screen.getByText('10 points')).toBeInTheDocument();

        const bars = container.querySelectorAll('.pollBar');

        expect(bars).toHaveLength(2);
        expect(bars[0]).toHaveStyle({ width: '75%' });
        expect(bars[1]).toHaveStyle({ width: '25%' });
    });

    it('renders zero width poll bars when there are no votes', async () => {
        fetchItemContentMock.mockResolvedValue({ ...poll, poll_votes_count: 0 });

        const { container } = renderItemDetails(43);

        await waitFor(() => expect(container.querySelector('.pollBar')).toBeInTheDocument());

        expect(container.querySelectorAll('.pollBar')[0]).toHaveStyle({ width: '0%' });
    });
});
