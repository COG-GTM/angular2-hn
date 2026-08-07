import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ItemDetails from './ItemDetails';
import { Story } from '../../models/story';
import { fetchItemContent } from '../../api/hackernews';
import { renderWithProviders, stubMatchMedia } from '../../testUtils';

vi.mock('../../api/hackernews', () => ({
    fetchItemContent: vi.fn(),
}));

const fetchItemContentMock = vi.mocked(fetchItemContent);

function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 100,
        title: 'A story',
        points: 42,
        user: 'pg',
        time_ago: '3 hours ago',
        type: 'story',
        url: 'https://example.com/post',
        domain: 'example.com',
        content: '<p>Story body</p>',
        comments_count: 1,
        comments: [],
        ...overrides,
    } as unknown as Story;
}

function renderItem(id = 100) {
    return renderWithProviders(<ItemDetails />, { path: '/item/:id', route: `/item/${id}` });
}

describe('ItemDetails', () => {
    beforeEach(() => {
        localStorage.clear();
        stubMatchMedia();
        fetchItemContentMock.mockReset();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('shows the loader, fetches the item for the route id and scrolls to the top', async () => {
        fetchItemContentMock.mockResolvedValue(makeStory());

        renderItem(321);
        expect(screen.getByText('Loading...')).toBeInTheDocument();

        await waitFor(() => expect(screen.getAllByText('A story')).not.toHaveLength(0));
        expect(fetchItemContentMock).toHaveBeenCalledWith(321);
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('renders the story header, body and comment count', async () => {
        fetchItemContentMock.mockResolvedValue(
            makeStory({
                comments_count: 2,
                comments: [
                    {
                        id: 1,
                        level: 0,
                        user: 'kate',
                        time: 0,
                        time_ago: '1 hour ago',
                        content: '<p>Nice</p>',
                        deleted: false,
                        comments: [],
                    },
                ],
            })
        );

        const { container } = renderItem();

        await waitFor(() => expect(screen.getAllByRole('link', { name: 'A story' })).toHaveLength(2));
        expect(screen.getAllByRole('link', { name: 'A story' })[0]).toHaveAttribute(
            'href',
            'https://example.com/post'
        );
        expect(screen.getByText('(example.com)')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'pg' })).toHaveAttribute('href', '/user/pg');
        expect(screen.getByRole('link', { name: '2 comments' })).toHaveAttribute('href', '/item/100');
        expect(container.querySelector('.subject')?.innerHTML).toBe('<p>Story body</p>');
        expect(screen.getByRole('link', { name: 'kate' })).toBeInTheDocument();
        expect(screen.getByText('Nice')).toBeInTheDocument();
    });

    it('links internally when the item has no external url', async () => {
        fetchItemContentMock.mockResolvedValue(makeStory({ url: 'item?id=100', domain: undefined }));

        renderItem();

        await waitFor(() => expect(screen.getAllByRole('link', { name: 'A story' })[0]).toHaveAttribute('href', '/item/100'));
    });

    it('renders poll options with a bar sized by their share of the votes', async () => {
        fetchItemContentMock.mockResolvedValue(
            makeStory({
                type: 'poll',
                url: 'item?id=100',
                poll_votes_count: 10,
                poll: [
                    { points: 7, content: '<p>Option A</p>' },
                    { points: 3, content: '<p>Option B</p>' },
                ],
            })
        );

        const { container } = renderItem();

        await waitFor(() => expect(screen.getByText('Option A')).toBeInTheDocument());
        expect(screen.getByText('7 points')).toBeInTheDocument();
        expect(screen.getByText('3 points')).toBeInTheDocument();

        const bars = container.querySelectorAll('.pollBar');
        expect(bars[0]).toHaveStyle({ width: '70%' });
        expect(bars[1]).toHaveStyle({ width: '30%' });
    });

    it('hides points, author and comments for job items', async () => {
        fetchItemContentMock.mockResolvedValue(makeStory({ type: 'job', comments_count: 0 }));

        renderItem();

        await waitFor(() => expect(screen.getAllByText('A story')).not.toHaveLength(0));
        expect(screen.queryByRole('link', { name: 'pg' })).not.toBeInTheDocument();
        expect(screen.queryByText(/points by/)).not.toBeInTheDocument();
    });

    it('opens the external title link in a new tab when the setting is enabled', async () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        fetchItemContentMock.mockResolvedValue(makeStory());

        renderItem();

        await waitFor(() => expect(screen.getAllByRole('link', { name: 'A story' })[0]).toHaveAttribute('target', '_blank'));
    });

    it('goes back in history when the mobile back button is clicked', async () => {
        fetchItemContentMock.mockResolvedValue(makeStory());

        const { container, router } = renderItem();
        await waitFor(() => expect(container.querySelector('.back-button')).toBeInTheDocument());

        const navigateSpy = vi.spyOn(router, 'navigate');
        await userEvent.click(container.querySelector('.back-button') as HTMLElement);

        expect(navigateSpy).toHaveBeenCalledWith(-1);
    });

    it('renders the error message when the item request fails', async () => {
        fetchItemContentMock.mockRejectedValue(new Error('offline'));

        renderItem();

        await waitFor(() => expect(screen.getByText('Could not load item comments.')).toBeInTheDocument());
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
});
