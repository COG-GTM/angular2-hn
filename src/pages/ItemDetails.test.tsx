import { beforeEach, describe, expect, it, vi } from 'vitest';

import ItemDetails from './ItemDetails';
import { fetchItemContent } from '../api/hackerNewsApi';
import { commentTree, makeStory, pollStory, story } from '../test/fixtures';
import { renderWithProviders, screen } from '../test/renderWithProviders';

vi.mock('../api/hackerNewsApi', () => ({
    fetchItemContent: vi.fn(),
}));

const fetchItemContentMock = vi.mocked(fetchItemContent);

function renderItemDetails(id: number) {
    return renderWithProviders(<ItemDetails />, {
        initialEntries: [`/item/${id}`],
        routePath: '/item/:id',
    });
}

describe('ItemDetails', () => {
    beforeEach(() => {
        fetchItemContentMock.mockReset();
    });

    it('shows the loader while the item is loading', () => {
        fetchItemContentMock.mockReturnValue(new Promise(() => {}));

        renderItemDetails(story.id);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders the title, subtext and content once loaded', async () => {
        fetchItemContentMock.mockResolvedValue(makeStory({ comments: [commentTree] }));

        renderItemDetails(story.id);

        expect(await screen.findAllByRole('link', { name: story.title })).toHaveLength(2);
        expect(screen.getByText(/points by/)).toBeInTheDocument();
        expect(screen.getByText('Story content')).toBeInTheDocument();
        expect(screen.getByText('Top level comment')).toBeInTheDocument();
        expect(fetchItemContentMock).toHaveBeenCalledWith(story.id);
    });

    it('renders an error message when the api rejects', async () => {
        fetchItemContentMock.mockRejectedValue(new Error('offline'));

        renderItemDetails(story.id);

        expect(await screen.findByText('Could not load item comments.')).toBeInTheDocument();
    });

    it('renders poll options with bars sized by their share of votes', async () => {
        fetchItemContentMock.mockResolvedValue(pollStory);

        const { container } = renderItemDetails(pollStory.id);

        expect(await screen.findByText('React')).toBeInTheDocument();
        expect(screen.getByText('30 points')).toBeInTheDocument();

        const bars = container.querySelectorAll<HTMLElement>('.pollBar');
        expect(bars).toHaveLength(2);
        expect(bars[0].style.width).toBe('75%');
        expect(bars[1].style.width).toBe('25%');
    });
});
