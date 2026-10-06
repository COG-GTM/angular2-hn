import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppRoutes } from './AppRoutes';
import { renderWithProviders } from './test/render';

beforeEach(() => {
    localStorage.clear();
});

const location = () => screen.getByTestId('location').textContent;

describe('AppRoutes', () => {
    it('redirects / to /news/1', () => {
        const { container } = renderWithProviders(<AppRoutes />, { route: '/' });
        expect(location()).toBe('/news/1');
        expect(container.querySelector('[data-feed-type="news"][data-page="1"]')).toBeInTheDocument();
    });

    it('redirects / to the saved default feed', () => {
        localStorage.setItem('defaultFeed', 'ask');
        renderWithProviders(<AppRoutes />, { route: '/' });
        expect(location()).toBe('/ask/1');
    });

    it.each(['news', 'newest', 'show', 'ask', 'jobs'])('renders the %s feed with the page param', (feed) => {
        const { container } = renderWithProviders(<AppRoutes />, { route: `/${feed}/3` });
        expect(container.querySelector(`[data-feed-type="${feed}"][data-page="3"]`)).toBeInTheDocument();
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
        const { container } = renderWithProviders(<AppRoutes />, { route: '/item/123' });
        await screen.findByTestId('location');
        await expect.poll(() => container.querySelector('[data-item-id="123"]')).toBeInTheDocument();
    });

    it('lazy loads item details from /item?id=', async () => {
        const { container } = renderWithProviders(<AppRoutes />, { route: '/item?id=456' });
        await expect.poll(() => container.querySelector('[data-item-id="456"]')).toBeInTheDocument();
    });

    it('lazy loads the user profile from /user?id= and /user/:id', async () => {
        const first = renderWithProviders(<AppRoutes />, { route: '/user?id=pg' });
        await expect.poll(() => first.container.querySelector('[data-user-id="pg"]')).toBeInTheDocument();
        first.unmount();
        const second = renderWithProviders(<AppRoutes />, { route: '/user/dang' });
        await expect.poll(() => second.container.querySelector('[data-user-id="dang"]')).toBeInTheDocument();
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
