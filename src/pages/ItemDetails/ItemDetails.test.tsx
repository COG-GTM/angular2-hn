import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as api from '../../services/hackernewsApi';
import { makeComment, makeStory } from '../../test/fixtures';
import { renderWithProviders } from '../../test/renderWithProviders';
import { ItemDetails } from './ItemDetails';

function renderItem() {
    return renderWithProviders(<ItemDetails />, { route: '/item/1', path: '/item/:id' });
}

describe('ItemDetails', () => {
    beforeEach(() => {
        vi.spyOn(api, 'fetchItemContent').mockResolvedValue(
            makeStory({ content: '<p>Story body</p>', comments: [makeComment()] })
        );
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('shows the loader until the item resolves', async () => {
        renderItem();

        expect(screen.getByText('Loading...')).toBeInTheDocument();
        await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
    });

    it('fetches the item id from the route', async () => {
        renderItem();

        await waitFor(() => expect(api.fetchItemContent).toHaveBeenCalledWith(1, expect.any(AbortSignal)));
    });

    it('renders the story header, body and comments', async () => {
        renderItem();

        expect(await screen.findByText('Story body')).toBeInTheDocument();
        expect(screen.getAllByRole('link', { name: 'A linked story' })[0]).toHaveAttribute(
            'href',
            'https://example.com/story'
        );
        expect(screen.getByText('(example.com)')).toBeInTheDocument();
        expect(screen.getByText('Nice write-up')).toBeInTheDocument();
        expect(screen.getAllByText(/3 comments/)).toHaveLength(1);
    });

    it('links the title internally for self posts', async () => {
        vi.spyOn(api, 'fetchItemContent').mockResolvedValue(
            makeStory({ id: 8, url: 'item?id=8', domain: undefined, title: 'Ask HN: anything?' })
        );

        renderItem();

        const titles = await screen.findAllByRole('link', { name: 'Ask HN: anything?' });
        titles.forEach((title) => expect(title).toHaveAttribute('href', '/item/8'));
    });

    it('opens the external title in a new tab when configured', async () => {
        localStorage.setItem('openLinkInNewTab', 'true');

        renderItem();

        const titles = await screen.findAllByRole('link', { name: 'A linked story' });
        titles.forEach((title) => expect(title).toHaveAttribute('target', '_blank'));
    });

    it('hides author and comment metadata for job posts', async () => {
        vi.spyOn(api, 'fetchItemContent').mockResolvedValue(
            makeStory({ type: 'job', user: null, points: null, comments_count: 0, content: '' })
        );

        renderItem();

        await screen.findAllByRole('link', { name: 'A linked story' });
        expect(screen.queryByText(/points by/)).not.toBeInTheDocument();
        expect(screen.queryByText(/discuss/)).not.toBeInTheDocument();
    });

    it('renders poll options with their share of the votes', async () => {
        vi.spyOn(api, 'fetchItemContent').mockResolvedValue(
            makeStory({
                type: 'poll',
                content: '',
                poll: [
                    { content: 'Option A', points: 30 },
                    { content: 'Option B', points: 70 },
                ],
                poll_votes_count: 100,
            })
        );

        renderItem();

        expect(await screen.findByText('Option A')).toBeInTheDocument();
        expect(screen.getByText('30 points')).toBeInTheDocument();
        expect(document.querySelectorAll('.pollBar')[0]).toHaveStyle({ width: '30%' });
        expect(document.querySelectorAll('.pollBar')[1]).toHaveStyle({ width: '70%' });
    });

    it('adds the head margin when the item has its own text', async () => {
        vi.spyOn(api, 'fetchItemContent').mockResolvedValue(
            makeStory({ text: '<p>Story body</p>', content: '<p>Story body</p>', comments_count: 0 })
        );

        renderItem();

        await screen.findByText('Story body');
        expect(document.querySelector('.laptop')).toHaveClass('head-margin');
        expect(document.querySelector('.laptop')).not.toHaveClass('item-header');
    });

    it('scrolls to the top when opened', async () => {
        renderItem();

        await waitFor(() => expect(window.scrollTo).toHaveBeenCalledWith(0, 0));
    });

    it('shows an error message when the item cannot be loaded', async () => {
        vi.spyOn(api, 'fetchItemContent').mockRejectedValue(new Error('offline'));

        renderItem();

        expect(await screen.findByText('Could not load item comments.')).toBeInTheDocument();
    });

    it('goes back in history from the mobile back button', async () => {
        renderItem();

        await screen.findByText('Story body');
        await userEvent.click(screen.getByRole('button', { name: 'Go back' }));

        expect(screen.getByRole('button', { name: 'Go back' })).toBeInTheDocument();
    });
});
