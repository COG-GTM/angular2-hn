import { screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as api from '../../api/hackernews';
import { makeComment, makeStory, renderWithProviders } from '../../test/utils';
import ItemDetails from './ItemDetails';

afterEach(() => vi.restoreAllMocks());

describe('ItemDetails', () => {
    it('renders the story, its text and its comments', async () => {
        vi.spyOn(api, 'fetchItemContent').mockResolvedValue(
            makeStory({ content: '<p>Story body</p>', comments: [makeComment()], comments_count: 1 })
        );

        renderWithProviders(<ItemDetails />, { route: '/item/1', path: '/item/:id' });

        expect(await screen.findByText('Story body')).toBeInTheDocument();
        expect(screen.getByText('Nice post')).toBeInTheDocument();
        expect(api.fetchItemContent).toHaveBeenCalledWith(1, expect.any(AbortSignal));
    });

    it('renders poll options with vote shares', async () => {
        vi.spyOn(api, 'fetchItemContent').mockResolvedValue(
            makeStory({
                type: 'poll',
                url: '',
                poll: [
                    { points: 25, content: 'Option A' },
                    { points: 75, content: 'Option B' },
                ],
                poll_votes_count: 100,
            })
        );

        const { container } = renderWithProviders(<ItemDetails />, { route: '/item/1', path: '/item/:id' });

        expect(await screen.findByText('Option A')).toBeInTheDocument();
        const bars = container.querySelectorAll('.pollBar');
        expect(bars[0]).toHaveStyle({ width: '25%' });
        expect(bars[1]).toHaveStyle({ width: '75%' });
    });

    it('renders an error message when the request fails', async () => {
        vi.spyOn(api, 'fetchItemContent').mockRejectedValue(new Error('offline'));

        renderWithProviders(<ItemDetails />, { route: '/item/1', path: '/item/:id' });

        await waitFor(() => expect(screen.getByText('Could not load item comments.')).toBeInTheDocument());
    });
});
