import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchFeed, fetchItemContent } from '../shared/api/hackernews-api';
import { makeStory } from '../test/fixtures';
import { renderWithProviders } from '../test/renderWithProviders';
import AppRoutes from './AppRoutes';

vi.mock('../shared/api/hackernews-api', () => ({
    fetchFeed: vi.fn(),
    fetchItemContent: vi.fn(),
}));

const fetchFeedMock = vi.mocked(fetchFeed);
const fetchItemContentMock = vi.mocked(fetchItemContent);

describe('AppRoutes', () => {
    beforeEach(() => {
        localStorage.clear();
        fetchFeedMock.mockReset();
        fetchFeedMock.mockResolvedValue([]);
        fetchItemContentMock.mockReset();
        fetchItemContentMock.mockResolvedValue(makeStory());
        vi.stubGlobal('scrollTo', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('redirects the root path to the first news page', () => {
        renderWithProviders(<AppRoutes />, { route: '/' });

        expect(fetchFeedMock).toHaveBeenCalledWith('news', 1);
    });

    it.each([
        ['/news/2', 'news', 2],
        ['/newest/1', 'newest', 1],
        ['/show/3', 'show', 3],
        ['/ask/1', 'ask', 1],
        ['/jobs/1', 'jobs', 1],
    ])('renders the feed page for %s with its feed type and page', (route, feedType, page) => {
        renderWithProviders(<AppRoutes />, { route });

        expect(fetchFeedMock).toHaveBeenCalledWith(feedType, page);
    });

    it('renders the item details page with the item id', () => {
        renderWithProviders(<AppRoutes />, { route: '/item/8863' });

        expect(fetchItemContentMock).toHaveBeenCalledWith(8863);
    });

    it('renders the user page with the user id', () => {
        renderWithProviders(<AppRoutes />, { route: '/user/pg' });

        expect(screen.getByTestId('user-page')).toHaveAttribute('data-user-id', 'pg');
    });
});
