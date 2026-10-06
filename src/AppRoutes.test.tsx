import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchFeed, fetchItemContent, fetchUser } from './api/hnApi';
import { AppRoutes } from './AppRoutes';
import { makeStory, makeUser } from './test/fixtures';
import { renderWithProviders } from './test/render';

vi.mock('./api/hnApi');

beforeEach(() => {
    localStorage.clear();
    vi.mocked(fetchFeed).mockReset();
    vi.mocked(fetchFeed).mockImplementation(async (feedType, page) => [
        makeStory({ title: `${feedType} story on page ${page}` }),
    ]);
    vi.mocked(fetchItemContent).mockReset();
    vi.mocked(fetchItemContent).mockImplementation(async (id) => makeStory({ id, title: `Item ${id}` }));
    vi.mocked(fetchUser).mockReset();
    vi.mocked(fetchUser).mockImplementation(async (id) => makeUser({ id }));
});

const location = () => screen.getByTestId('location').textContent;

describe('AppRoutes', () => {
    it('redirects / to /news/1', async () => {
        renderWithProviders(<AppRoutes />, { route: '/' });
        expect(location()).toBe('/news/1');
        expect(await screen.findByText('news story on page 1')).toBeInTheDocument();
    });

    it('redirects / to the saved default feed', () => {
        localStorage.setItem('defaultFeed', 'ask');
        renderWithProviders(<AppRoutes />, { route: '/' });
        expect(location()).toBe('/ask/1');
    });

    it.each(['news', 'newest', 'show', 'ask', 'jobs'])('renders the %s feed with the page param', async (feed) => {
        renderWithProviders(<AppRoutes />, { route: `/${feed}/3` });
        expect(await screen.findByText(`${feed} story on page 3`)).toBeInTheDocument();
        expect(fetchFeed).toHaveBeenCalledWith(feed, 3, expect.any(AbortSignal));
    });

    it('redirects a feed without a page to page 1', () => {
        renderWithProviders(<AppRoutes />, { route: '/show' });
        expect(location()).toBe('/show/1');
    });

    it('redirects an invalid page to page 1', () => {
        renderWithProviders(<AppRoutes />, { route: '/newest/abc' });
        expect(location()).toBe('/newest/1');
    });

    it('lazy loads item details from /item/:id', async () => {
        renderWithProviders(<AppRoutes />, { route: '/item/123' });
        expect((await screen.findAllByRole('link', { name: 'Item 123' })).length).toBeGreaterThan(0);
        expect(fetchItemContent).toHaveBeenCalledWith(123, expect.any(AbortSignal));
    });

    it('lazy loads item details from /item?id=', async () => {
        renderWithProviders(<AppRoutes />, { route: '/item?id=456' });
        expect((await screen.findAllByRole('link', { name: 'Item 456' })).length).toBeGreaterThan(0);
        expect(fetchItemContent).toHaveBeenCalledWith(456, expect.any(AbortSignal));
    });

    it('lazy loads the user profile from /user?id= and /user/:id', async () => {
        const first = renderWithProviders(<AppRoutes />, { route: '/user?id=pg' });
        expect(await screen.findByText('Profile: pg')).toBeInTheDocument();
        first.unmount();
        renderWithProviders(<AppRoutes />, { route: '/user/dang' });
        expect(await screen.findByText('Profile: dang')).toBeInTheDocument();
    });

    it('redirects unknown routes to the default feed', () => {
        renderWithProviders(<AppRoutes />, { route: '/nope' });
        expect(location()).toBe('/news/1');
    });

    it('renders the header and footer shell', () => {
        renderWithProviders(<AppRoutes />, { route: '/news/1' });
        expect(screen.getByRole('banner')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
    });
});
