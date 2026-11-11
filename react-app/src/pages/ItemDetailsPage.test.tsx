import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Comment, Story } from '../models';
import { routes } from '../routes';
import { SettingsProvider } from '../settings';

function comment(id: number, overrides: Partial<Comment> = {}): Comment {
    return {
        id,
        level: 0,
        user: `user${id}`,
        time: 0,
        time_ago: '2 hours ago',
        content: `<p>Comment ${id}</p>`,
        deleted: false,
        comments: [],
        ...overrides,
    };
}

function story(overrides: Partial<Story> = {}): Story {
    return {
        id: 1,
        title: 'A story',
        points: 42,
        user: 'pg',
        time: 0,
        time_ago: '3 hours ago',
        type: 'link',
        url: 'https://example.com/a',
        domain: 'example.com',
        content: '',
        comments: [],
        comments_count: 0,
        ...overrides,
    };
}

function stubApi(routesByUrl: Record<string, unknown>) {
    vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string) =>
            url in routesByUrl ? Response.json(routesByUrl[url]) : new Response('nope', { status: 500 })
        )
    );
}

function renderAt(path: string) {
    const router = createMemoryRouter(routes, { initialEntries: ['/news/1', path], initialIndex: 1 });
    render(
        <SettingsProvider>
            <RouterProvider router={router} />
        </SettingsProvider>
    );
    return router;
}

const ITEM = 'https://node-hnapi.herokuapp.com/item/1';

afterEach(() => vi.unstubAllGlobals());

describe('ItemDetailsPage', () => {
    it('renders the story header and nested comments', async () => {
        stubApi({
            [ITEM]: story({
                comments_count: 3,
                comments: [comment(10, { comments: [comment(11, { level: 1 })] }), comment(12, { deleted: true })],
            }),
        });
        renderAt('/item/1');
        const page = await screen.findByTestId('item-page');
        expect((await within(page).findAllByRole('link', { name: 'A story' }))[0]).toHaveAttribute(
            'href',
            'https://example.com/a'
        );
        expect(page).toHaveTextContent('42 points by');
        expect(page).toHaveTextContent('3 comments');
        expect(screen.getByText('Comment 10')).toBeInTheDocument();
        expect(screen.getByText('Comment 11')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'user11' })).toHaveAttribute('href', '/user/user11');
        expect(page).toHaveTextContent('Comment Deleted');
    });

    it('collapses and expands a comment subtree', async () => {
        stubApi({ [ITEM]: story({ comments: [comment(10, { comments: [comment(11)] })] }) });
        renderAt('/item/1');
        const toggle = (await screen.findAllByRole('button', { name: '[-]' }))[0];
        await userEvent.click(toggle);
        expect(toggle).toHaveTextContent('[+]');
        expect(screen.getByText('Comment 10')).not.toBeVisible();
        expect(screen.getByText('Comment 11')).not.toBeVisible();
        await userEvent.click(toggle);
        expect(screen.getByText('Comment 11')).toBeVisible();
    });

    it('renders poll results with proportional bars', async () => {
        stubApi({
            [ITEM]: story({ type: 'poll', url: 'item?id=1', poll: [{}, {}] as Story['poll'] }),
            'https://node-hnapi.herokuapp.com/item/2': { points: 30, content: '<p>Yes</p>' },
            'https://node-hnapi.herokuapp.com/item/3': { points: 10, content: '<p>No</p>' },
        });
        renderAt('/item/1');
        expect(await screen.findByText('Yes')).toBeInTheDocument();
        expect(screen.getByText('30 points')).toBeInTheDocument();
        const bars = document.querySelectorAll<HTMLElement>('.pollBar');
        expect([...bars].map((b) => b.style.width)).toEqual(['75%', '25%']);
    });

    it('renders a failed poll option as zero points', async () => {
        stubApi({
            [ITEM]: story({ type: 'poll', url: 'item?id=1', poll: [{}, {}] as Story['poll'] }),
            'https://node-hnapi.herokuapp.com/item/2': { points: 5, content: '<p>Yes</p>' },
        });
        renderAt('/item/1');
        expect(await screen.findByText('Yes')).toBeInTheDocument();
        expect(screen.getByText('0 points')).toBeInTheDocument();
        const bars = document.querySelectorAll<HTMLElement>('.pollBar');
        expect([...bars].map((b) => b.style.width)).toEqual(['100%', '0%']);
    });

    it('toggles a comment from the keyboard', async () => {
        stubApi({ [ITEM]: story({ comments: [comment(10)] }) });
        renderAt('/item/1');
        const toggle = await screen.findByRole('button', { name: '[-]' });
        toggle.focus();
        await userEvent.keyboard('{Enter}');
        expect(toggle).toHaveTextContent('[+]');
        await userEvent.keyboard(' ');
        expect(toggle).toHaveTextContent('[-]');
    });

    it('sanitizes HTML from the API', async () => {
        stubApi({
            [ITEM]: story({
                content: '<p>Body</p><img src="x" onerror="alert(1)"><script>alert(2)</script>',
                comments: [comment(10, { content: '<a href="javascript:alert(3)">bad</a>' })],
            }),
        });
        renderAt('/item/1');
        await screen.findByText('Body');
        const page = screen.getByTestId('item-page');
        expect(page.innerHTML).not.toContain('onerror');
        expect(page.innerHTML).not.toContain('<script');
        expect(page.innerHTML).not.toContain('javascript:');
    });

    it('goes back from the mobile back button', async () => {
        stubApi({ [ITEM]: story(), 'https://node-hnapi.herokuapp.com/news?page=1': [] });
        const router = renderAt('/item/1');
        await userEvent.click(await screen.findByRole('button', { name: 'Back' }));
        expect(router.state.location.pathname).toBe('/news/1');
    });

    it('shows an error when the item fails to load', async () => {
        stubApi({});
        renderAt('/item/1');
        expect(await screen.findByText(/Could not load item comments\./)).toBeInTheDocument();
    });
});
