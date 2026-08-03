import { screen, waitFor } from '@testing-library/react';

import AppRoutes from './AppRoutes';
import * as api from './api/hackerNewsApi';
import { makeStory, makeUser } from './test/fixtures';
import { renderWithProviders } from './test/render';

vi.mock('./api/hackerNewsApi');

const fetchFeed = vi.mocked(api.fetchFeed);

beforeEach(() => {
    fetchFeed.mockReset();
    fetchFeed.mockResolvedValue([makeStory({ title: 'Top story' })]);
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

describe('AppRoutes', () => {
    it('redirects the root path to the first page of news', async () => {
        renderWithProviders(<AppRoutes />, { route: '/' });

        await waitFor(() => expect(fetchFeed).toHaveBeenCalledWith('news', 1, expect.any(AbortSignal)));
        expect(await screen.findByText('Top story')).toBeInTheDocument();
    });

    it.each(['news', 'newest', 'show', 'ask', 'jobs'])('serves the %s feed', async (feed) => {
        renderWithProviders(<AppRoutes />, { route: `/${feed}/2` });

        await waitFor(() => expect(fetchFeed).toHaveBeenCalledWith(feed, 2, expect.any(AbortSignal)));
    });

    it('serves an item discussion', async () => {
        vi.mocked(api.fetchItemContent).mockResolvedValue(makeStory({ id: 7, title: 'Discussed story' }));

        renderWithProviders(<AppRoutes />, { route: '/item/7' });

        expect((await screen.findAllByRole('link', { name: 'Discussed story' }))[0]).toBeInTheDocument();
    });

    it('serves a user profile', async () => {
        vi.mocked(api.fetchUser).mockResolvedValue(makeUser());

        renderWithProviders(<AppRoutes />, { route: '/user/pg' });

        expect(await screen.findByText('Profile: pg')).toBeInTheDocument();
    });
});
