import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { vi } from 'vitest';

import { SettingsProvider } from '../shared/context/SettingsProvider';
import type { Comment, Story } from '../shared/models';
import { makeComment, makeStory } from '../test/fixtures';
import { createTestQueryClient, mockFetch, renderWithProviders } from '../test/utils';
import { ItemDetails } from './ItemDetails';

function renderItem(story: Story, settings?: { openLinkInNewTab?: boolean }) {
    mockFetch({ [`/item/${story.id}`]: story });
    return renderWithProviders(<ItemDetails />, { path: '/item/:id', route: `/item/${story.id}`, settings });
}

describe('ItemDetails', () => {
    it('shows the loader while the item is loading', async () => {
        let release: () => void = () => {};
        const gate = new Promise<void>((resolve) => (release = resolve));
        const inner = mockFetch({ '/item/1': makeStory() });
        vi.stubGlobal(
            'fetch',
            vi.fn(async (input: RequestInfo | URL) => {
                await gate;
                return inner(input);
            })
        );
        const { container } = renderWithProviders(<ItemDetails />, { path: '/item/:id', route: '/item/1' });
        await waitFor(() => expect(container.querySelector('.loader')).toBeInTheDocument());
        release();
        expect(await screen.findAllByText('Example story')).toHaveLength(2);
        expect(container.querySelector('.loader')).not.toBeInTheDocument();
    });

    it('shows the error message when the item fails to load', async () => {
        mockFetch({ '/item/1': { status: 500, body: 'boom' } });
        renderWithProviders(<ItemDetails />, { path: '/item/:id', route: '/item/1' });
        expect(await screen.findByText('Could not load item comments.')).toBeInTheDocument();
    });

    it('scrolls to the top on mount', async () => {
        renderItem(makeStory());
        await screen.findAllByText('Example story');
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('renders an external story header with domain and subtext', async () => {
        const { container } = renderItem(makeStory({ id: 8863, comments_count: 2, text: '<p>hi</p>' }));
        await screen.findAllByText('Example story');
        const laptop = container.querySelector('.laptop')!;
        expect(laptop).toHaveClass('item-header', 'head-margin');
        const title = laptop.querySelector('a.title')!;
        expect(title).toHaveAttribute('href', 'https://example.com/post');
        expect(title).not.toHaveAttribute('target');
        expect(laptop.querySelector('.domain')).toHaveTextContent('(example.com)');
        const subtext = laptop.querySelector('.subtext')!;
        expect(subtext).toHaveTextContent('42 points by pg 2 hours ago | 2 comments');
        expect(subtext.querySelector('a[href="/user/pg"]')).toBeInTheDocument();
        expect(subtext.querySelector('.item-details a')).toHaveAttribute('href', '/item/8863');
        expect(container.querySelector('.mobile.item-header .title-block a.title')).toHaveAttribute(
            'href',
            'https://example.com/post'
        );
    });

    it('opens external links in a new tab when the setting is on', async () => {
        const { container } = renderItem(makeStory(), { openLinkInNewTab: true });
        await screen.findAllByText('Example story');
        container.querySelectorAll('a.title').forEach((a) => {
            expect(a).toHaveAttribute('target', '_blank');
            expect(a).toHaveAttribute('rel', 'noopener');
        });
    });

    it('links internal (Ask HN) items to /item/:id without a domain', async () => {
        const { container } = renderItem(
            makeStory({ id: 5, url: 'item?id=5', domain: '', comments_count: 0, type: 'story' })
        );
        await screen.findAllByText('Example story');
        container.querySelectorAll('a.title').forEach((a) => expect(a).toHaveAttribute('href', '/item/5'));
        expect(container.querySelector('.domain')).not.toBeInTheDocument();
        expect(container.querySelector('.laptop')).not.toHaveClass('item-header');
        expect(container.querySelector('.laptop')).not.toHaveClass('head-margin');
        expect(container.querySelector('.subtext')).toHaveTextContent('discuss');
    });

    it('hides points, user and comments for jobs', async () => {
        const { container } = renderItem(makeStory({ type: 'job', comments_count: 0, time_ago: '3 days ago' }));
        await screen.findAllByText('Example story');
        const laptop = container.querySelector('.laptop')!;
        expect(laptop).toHaveClass('item-header');
        const subtext = laptop.querySelector('.subtext')!;
        expect(subtext).toHaveTextContent(/^3 days ago$/);
        expect(subtext.querySelector('a')).not.toBeInTheDocument();
        expect(subtext.querySelector('.item-details')).not.toBeInTheDocument();
    });

    it('renders poll results with proportional bars', async () => {
        const poll = makeStory({
            id: 126809,
            type: 'poll',
            url: 'item?id=126809',
            poll: [
                { content: '', points: 0 },
                { content: '', points: 0 },
            ],
        });
        const options: Record<string, { content: string; points: number }> = {
            '126810': { content: 'Yes', points: 30 },
            '126811': { content: '<b>No</b><script>alert(1)</script>', points: 10 },
        };
        mockFetch({ '/item/': (url: string) => options[url.split('/').pop()!] ?? poll });
        const { container } = renderWithProviders(<ItemDetails />, { path: '/item/:id', route: '/item/126809' });
        await screen.findAllByText('Example story');
        const rows = container.querySelectorAll('.pollResults > .pollContent');
        expect(rows).toHaveLength(2);
        expect(rows[0]).toHaveTextContent('Yes');
        expect(rows[0].querySelector('.subtext')).toHaveTextContent('30 points');
        expect(rows[0].querySelector<HTMLElement>('.pollBar')!.style.width).toBe('75%');
        expect(rows[1].querySelector<HTMLElement>('.pollBar')!.style.width).toBe('25%');
        expect(rows[1].querySelector('b')).toHaveTextContent('No');
        expect(rows[1].innerHTML).not.toContain('script');
    });

    it('does not render poll results for non-polls', async () => {
        const { container } = renderItem(makeStory());
        await screen.findAllByText('Example story');
        expect(container.querySelector('.pollResults')).not.toBeInTheDocument();
    });

    it('sanitizes the story content', async () => {
        const { container } = renderItem(
            makeStory({
                content:
                    '<p>Safe <a href="https://x.com">x</a></p><img src=x onerror="alert(1)"><script>alert(2)</script>',
            })
        );
        await screen.findAllByText('Example story');
        const subject = container.querySelector('p.subject')!;
        expect(subject).toHaveTextContent('Safe x');
        expect(subject.innerHTML).not.toMatch(/script|onerror|<img/);
    });

    it('renders the top-level comments with nested replies', async () => {
        const deep = (depth: number): Comment =>
            makeComment({
                id: 1000 + depth,
                user: `user${depth}`,
                comments: depth < 5 ? [deep(depth + 1)] : [],
            });
        const { container } = renderItem(makeStory({ comments: [deep(0), makeComment({ id: 2, user: 'other' })] }));
        await screen.findAllByText('Example story');
        expect(container.querySelectorAll('ul.comment-list > li')).toHaveLength(2);
        expect(screen.getByText('user5')).toBeInTheDocument();
        expect(container.querySelectorAll('.comment-tree')).toHaveLength(7);
    });

    it('goes back in history when the back button is clicked', async () => {
        const story = makeStory();
        mockFetch({ '/item/1': story });
        const router = createMemoryRouter(
            [
                { path: '/news/1', element: <div>feed page</div> },
                { path: '/item/:id', element: <ItemDetails /> },
            ],
            { initialEntries: ['/news/1', '/item/1'], initialIndex: 1 }
        );
        const { container } = render(
            <QueryClientProvider client={createTestQueryClient()}>
                <SettingsProvider>
                    <RouterProvider router={router} />
                </SettingsProvider>
            </QueryClientProvider>
        );
        await screen.findAllByText('Example story');
        await userEvent.click(container.querySelector('.back-button')!);
        expect(await screen.findByText('feed page')).toBeInTheDocument();
        expect(router.state.location.pathname).toBe('/news/1');
    });
});
