import { screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as api from '../../api/hackernews';
import { makeStory, renderWithProviders } from '../../test/utils';
import { Feed } from './Feed';

afterEach(() => vi.restoreAllMocks());

describe('Feed', () => {
    it('renders the stories for the requested page', async () => {
        const fetchFeed = vi.spyOn(api, 'fetchFeed').mockResolvedValue([makeStory()]);

        renderWithProviders(<Feed feedType="news" />, { route: '/news/3', path: '/news/:page' });

        expect(await screen.findByRole('link', { name: 'A story' })).toBeInTheDocument();
        expect(fetchFeed).toHaveBeenCalledWith('news', 3, expect.any(AbortSignal));
        expect(screen.getByRole('list')).toHaveAttribute('start', '61');
    });

    it('shows prev/next links only where they apply', async () => {
        vi.spyOn(api, 'fetchFeed').mockResolvedValue(
            Array.from({ length: 30 }, (_, index) => makeStory({ id: index + 1, title: `Story ${index + 1}` }))
        );

        renderWithProviders(<Feed feedType="news" />, { route: '/news/2', path: '/news/:page' });

        expect(await screen.findByRole('link', { name: /Prev/ })).toHaveAttribute('href', '/news/1');
        expect(screen.getByRole('link', { name: /More/ })).toHaveAttribute('href', '/news/3');
    });

    it('renders an error message when the request fails', async () => {
        vi.spyOn(api, 'fetchFeed').mockRejectedValue(new Error('offline'));

        renderWithProviders(<Feed feedType="news" />, { route: '/news/1', path: '/news/:page' });

        await waitFor(() => expect(screen.getByText('Could not load news stories.')).toBeInTheDocument());
    });
});
