import { screen, within } from '@testing-library/react';
import { Link } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { apiUrls } from '../../shared/api';
import type { Comment as CommentModel, Story } from '../../shared/models';
import { deferred, jsonResponse, mockFetch, renderWithProviders, textResponse } from '../../shared/test-utils';
import { ItemDetails } from './ItemDetails';

const ROUTE = { path: '/item/:id' };

function comment(id: number, user: string, content: string, comments: CommentModel[] = []): CommentModel {
    return { id, level: 0, user, time: 0, time_ago: `${id} hours ago`, content, comments };
}

function story(overrides: Partial<Story> = {}): Story {
    return {
        id: 100,
        title: 'A story title',
        points: 42,
        user: 'pg',
        time: 0,
        time_ago: '3 hours ago',
        type: 'link',
        url: 'https://example.com/post',
        domain: 'example.com',
        comments_count: 3,
        comments: [
            comment(1, 'alice', '<p>Top level</p>', [comment(2, 'bob', 'Nested reply', [comment(3, 'carol', 'Deep')])]),
        ],
        ...overrides,
    };
}

function renderItem(id: string | number = 100) {
    return renderWithProviders(<ItemDetails />, { route: `/item/${id}`, ...ROUTE });
}

describe('ItemDetails', () => {
    it('shows the loader while the item is loading', async () => {
        const pending = deferred<Story>();
        mockFetch({ [apiUrls.item(100)]: () => pending.promise });
        renderItem();
        expect(screen.getByRole('status')).toBeInTheDocument();
        pending.resolve(story());
        expect(await screen.findAllByText('A story title')).toHaveLength(2);
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('renders title, domain, subtext and the nested comment tree', async () => {
        mockFetch({ [apiUrls.item(100)]: story() });
        const { container } = renderItem();

        const titles = await screen.findAllByRole('link', { name: 'A story title' });
        expect(titles).toHaveLength(2);
        titles.forEach((title) => {
            expect(title).toHaveAttribute('href', 'https://example.com/post');
            expect(title).not.toHaveAttribute('target');
        });
        expect(screen.getByText('(example.com)')).toHaveClass('domain');

        const subtext = container.querySelector('.laptop .subtext') as HTMLElement;
        expect(subtext).toHaveTextContent('42 points by pg 3 hours ago | 3 comments');
        expect(within(subtext).getByRole('link', { name: 'pg' })).toHaveAttribute('href', '/user/pg');
        expect(within(subtext).getByRole('link', { name: '3 comments' })).toHaveAttribute('href', '/item/100');
        expect(container.querySelector('.laptop')).toHaveClass('item-header');

        expect(screen.getByRole('link', { name: 'alice' })).toHaveAttribute('href', '/user/alice');
        expect(screen.getByRole('link', { name: 'carol' })).toBeInTheDocument();
        const tree = container.querySelectorAll('.comment-list .comment .subtree .comment .subtree .comment');
        expect(tree).toHaveLength(1);
        expect(tree[0]).toHaveTextContent('Deep');
    });

    it('opens external title links in a new tab when the setting is on', async () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        mockFetch({ [apiUrls.item(100)]: story() });
        renderItem();
        const titles = await screen.findAllByRole('link', { name: 'A story title' });
        titles.forEach((title) => {
            expect(title).toHaveAttribute('target', '_blank');
            expect(title).toHaveAttribute('rel', 'noopener');
        });
    });

    it('links internal (Ask HN) titles to the item and renders sanitized content', async () => {
        mockFetch({
            [apiUrls.item(100)]: story({
                type: 'ask',
                url: 'item?id=100',
                domain: undefined,
                comments_count: 0,
                comments: [],
                content: 'Hello<p>World <a href="javascript:alert(1)" onclick="x()">bad</a></p><script>evil()</script>',
            }),
        });
        const { container } = renderItem();
        const titles = await screen.findAllByRole('link', { name: 'A story title' });
        titles.forEach((title) => expect(title).toHaveAttribute('href', '/item/100'));
        expect(container.querySelector('.domain')).toBeNull();
        expect(screen.getByRole('link', { name: 'discuss' })).toBeInTheDocument();
        expect(container.querySelector('.laptop')).not.toHaveClass('item-header');

        const subject = container.querySelector('.subject') as HTMLElement;
        expect(subject).toHaveTextContent('HelloWorld bad');
        expect(subject.querySelector('script')).toBeNull();
        const link = subject.querySelector('a') as HTMLAnchorElement;
        expect(link).not.toHaveAttribute('href');
        expect(link).not.toHaveAttribute('onclick');
    });

    it('renders job subtext without points, user or comments', async () => {
        mockFetch({
            [apiUrls.item(100)]: story({ type: 'job', points: null, user: null, comments_count: 0, comments: [] }),
        });
        const { container } = renderItem();
        await screen.findAllByText('A story title');
        const subtext = container.querySelector('.laptop .subtext') as HTMLElement;
        expect(subtext).toHaveTextContent(/^3 hours ago$/);
        expect(subtext.querySelector('.item-details')).toBeNull();
        expect(container.querySelector('.laptop')).toHaveClass('item-header');
    });

    it('renders poll options with proportional bars', async () => {
        const poll = story({
            id: 200,
            type: 'poll',
            url: 'item?id=200',
            comments: [],
            poll: [
                { points: 0, content: '' },
                { points: 0, content: '' },
            ] as unknown as Story['poll'],
        });
        mockFetch({
            [apiUrls.item(200)]: poll,
            [apiUrls.item(201)]: {
                id: 201,
                type: 'pollopt',
                points: 30,
                content: '<b>Yes</b><img src=x onerror=alert(1)>',
            },
            [apiUrls.item(202)]: { id: 202, type: 'pollopt', points: 10, content: 'No' },
        });
        const { container } = renderItem(200);
        const bars = await screen.findAllByTestId('poll-bar');
        expect(bars.map((bar) => bar.style.width)).toEqual(['75%', '25%']);
        expect(screen.getByText('30 points')).toBeInTheDocument();
        expect(screen.getByText('Yes').tagName).toBe('B');
        expect(container.querySelector('.pollContent img')).toBeNull();
    });

    it('guards poll bars against a zero vote total', async () => {
        mockFetch({
            [apiUrls.item(300)]: story({
                id: 300,
                type: 'poll',
                url: 'item?id=300',
                comments: [],
                poll: [{ points: 0, content: '' }] as unknown as Story['poll'],
            }),
            [apiUrls.item(301)]: { id: 301, type: 'pollopt', points: 0, content: 'Nobody' },
        });
        renderItem(300);
        const [bar] = await screen.findAllByTestId('poll-bar');
        expect(bar.style.width).toBe('0%');
    });

    it.each([
        ['an unknown id (HTTP 200 error body)', 999, { [apiUrls.item(999)]: { error: 'Item 999 not found' } }],
        ['a server error', 998, { [apiUrls.item(998)]: textResponse('boom', 500) }],
        ['a null body', 997, { [apiUrls.item(997)]: jsonResponse(null) }],
    ])('shows the error message for %s', async (_label, id, routes) => {
        mockFetch(routes);
        renderItem(id);
        expect(await screen.findByRole('alert')).toHaveTextContent('Could not load item comments.');
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it.each(['abc', '0', '-5', '1.5'])('shows the error message for the invalid id %s without fetching', async (id) => {
        const handle = mockFetch({});
        renderItem(id);
        expect(await screen.findByRole('alert')).toHaveTextContent('Could not load item comments.');
        expect(handle.calls).toHaveLength(0);
    });

    it('scrolls to the top on mount', async () => {
        mockFetch({ [apiUrls.item(100)]: story() });
        renderItem();
        await screen.findAllByText('A story title');
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('navigates back from the keyboard-operable back button', async () => {
        mockFetch({ [apiUrls.item(100)]: story() });
        const { user } = renderWithProviders(<ItemDetails />, { route: '/item/100', ...ROUTE });
        const back = await screen.findByRole('button', { name: 'Go back' });
        expect(back).toHaveClass('back-button');
        expect(back).toHaveAttribute('tabindex', '0');
        back.focus();
        await user.keyboard('{Enter}');
        // MemoryRouter has a single entry: navigate(-1) is a no-op, so the page simply stays rendered.
        expect(screen.getAllByText('A story title')).toHaveLength(2);
    });
});

describe('ItemDetails navigation between ids', () => {
    it('loads the new item and scrolls to the top when :id changes', async () => {
        mockFetch({
            [apiUrls.item(100)]: story({ comments: [] }),
            [apiUrls.item(101)]: story({ id: 101, title: 'Second story', comments: [] }),
        });
        const { user } = renderWithProviders(
            <>
                <ItemDetails />
                <Link to="/item/101">next</Link>
            </>,
            { route: '/item/100', ...ROUTE }
        );
        await screen.findAllByText('A story title');
        vi.mocked(window.scrollTo).mockClear();
        await user.click(screen.getByRole('link', { name: 'next' }));
        expect(await screen.findAllByText('Second story')).toHaveLength(2);
        expect(screen.queryByText('A story title')).not.toBeInTheDocument();
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });
});
