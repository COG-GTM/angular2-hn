import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Story } from '../models';
import { routes } from '../routes';
import { SettingsProvider } from '../settings';

function story(id: number, overrides: Partial<Story> = {}): Story {
    return {
        id,
        title: `Story ${id}`,
        points: 10,
        user: 'pg',
        time: 0,
        time_ago: '1 hour ago',
        type: 'link',
        url: `https://example.com/${id}`,
        domain: 'example.com',
        comments: [],
        comments_count: id % 2,
        ...overrides,
    };
}

function stubFeed(handler: (url: string) => Response | Promise<Response>) {
    const fn = vi.fn(async (url: string) => handler(url));
    vi.stubGlobal('fetch', fn);
    return fn;
}

function renderAt(path: string) {
    const router = createMemoryRouter(routes, { initialEntries: [path] });
    render(
        <SettingsProvider>
            <RouterProvider router={router} />
        </SettingsProvider>
    );
    return router;
}

const fullPage = (start: number) => Array.from({ length: 30 }, (_, i) => story(start + i));

afterEach(() => vi.unstubAllGlobals());

describe('FeedPage', () => {
    it('renders stories with numbering, metadata and a More link', async () => {
        stubFeed(() => new Response(JSON.stringify(fullPage(1))));
        renderAt('/news/1');
        const first = await screen.findByRole('link', { name: 'Story 1' });
        expect(first).toHaveAttribute('href', 'https://example.com/1');
        expect(first).not.toHaveAttribute('target');
        expect(screen.getByRole('list')).toHaveAttribute('start', '1');
        expect(screen.getAllByText('1 comment').length).toBeGreaterThan(0);
        expect(screen.getAllByText('discuss').length).toBeGreaterThan(0);
        expect(screen.queryByText('‹ Prev')).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'More ›' })).toHaveAttribute('href', '/news/2');
    });

    it('pages forward and back', async () => {
        const fetchMock = stubFeed((url) => {
            const page = Number(new URL(url).searchParams.get('page'));
            return new Response(JSON.stringify(page === 2 ? [story(31)] : fullPage(1)));
        });
        const router = renderAt('/newest/1');
        await userEvent.click(await screen.findByRole('link', { name: 'More ›' }));
        expect(await screen.findByRole('link', { name: 'Story 31' })).toBeInTheDocument();
        expect(router.state.location.pathname).toBe('/newest/2');
        expect(screen.getByRole('list')).toHaveAttribute('start', '31');
        expect(screen.queryByText('More ›')).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: '‹ Prev' })).toHaveAttribute('href', '/newest/1');
        expect(fetchMock).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/newest?page=2', expect.anything());

        await userEvent.click(screen.getByRole('link', { name: '‹ Prev' }));
        expect(await screen.findByRole('link', { name: 'Story 1' })).toBeInTheDocument();
        expect(router.state.location.pathname).toBe('/newest/1');
        expect(screen.getByRole('list')).toHaveAttribute('start', '1');
        expect(screen.queryByText('‹ Prev')).not.toBeInTheDocument();
    });

    it('ignores a slower response for a page the user already left', async () => {
        let releasePage1!: () => void;
        const page1 = new Promise<void>((resolve) => (releasePage1 = resolve));
        const fetchMock = stubFeed(async (url) => {
            if (url.endsWith('page=1')) {
                await page1;
                return new Response(JSON.stringify(fullPage(1)));
            }
            return new Response(JSON.stringify([story(31)]));
        });
        const router = renderAt('/newest/1');
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
        await router.navigate('/newest/2');
        expect(await screen.findByRole('link', { name: 'Story 31' })).toBeInTheDocument();
        releasePage1();
        await page1;
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(screen.getByRole('link', { name: 'Story 31' })).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Story 1' })).not.toBeInTheDocument();
    });

    it('links internal posts to item details and honours open-in-new-tab', async () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        stubFeed(
            () =>
                new Response(JSON.stringify([story(1), story(2, { url: 'item?id=2', domain: undefined, type: 'ask' })]))
        );
        renderAt('/ask/1');
        expect(await screen.findByRole('link', { name: 'Story 1' })).toHaveAttribute('target', '_blank');
        expect(screen.getByRole('link', { name: 'Story 2' })).toHaveAttribute('href', '/item/2');
    });

    it('shows the jobs header and hides points and comments for jobs', async () => {
        stubFeed(() => new Response(JSON.stringify([story(1, { type: 'job' })])));
        renderAt('/jobs/1');
        expect(await screen.findByText(/jobs at startups that were funded by Y Combinator/)).toBeInTheDocument();
        expect(screen.queryByText(/points by/)).not.toBeInTheDocument();
        expect(screen.queryByText('discuss')).not.toBeInTheDocument();
        expect(screen.queryByText(/comment/)).not.toBeInTheDocument();
        expect(screen.queryByText(/★/)).not.toBeInTheDocument();
    });

    it('shows an error message when the feed fails to load', async () => {
        stubFeed(() => new Response('boom', { status: 500 }));
        renderAt('/show/1');
        expect(await screen.findByText(/Could not load show stories\./)).toBeInTheDocument();
    });
});
