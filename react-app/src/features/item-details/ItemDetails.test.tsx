import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useNavigate } from 'react-router';

import { apiUrls } from '../../shared/api';
import type { Story } from '../../shared/models';
import { deferred, mockFetch, renderWithProviders, textResponse } from '../../shared/test-utils';
import { ItemDetails } from './ItemDetails';

function story(overrides: Partial<Story> = {}): Story {
    return {
        id: 42,
        title: 'A great story',
        points: 128,
        user: 'pg',
        time: 0,
        time_ago: '3 hours ago',
        type: 'link',
        url: 'https://example.com/post',
        domain: 'example.com',
        comments: [
            {
                id: 100,
                level: 0,
                user: 'dang',
                time: 0,
                time_ago: '2 hours ago',
                content: 'First!',
                comments: [],
            },
        ],
        comments_count: 1,
        ...overrides,
    };
}

function renderItem(id: string | number = 42, otherRoutes = {}) {
    return renderWithProviders(<ItemDetails />, { route: `/item/${id}`, path: '/item/:id', otherRoutes });
}

describe('ItemDetails', () => {
    it('shows the loader while the item loads, then the item', async () => {
        const pending = deferred<unknown>();
        mockFetch({ [apiUrls.item(42)]: () => pending.promise });
        const { container } = renderItem();
        expect(screen.getByRole('status')).toHaveTextContent('Loading...');
        pending.resolve(story());
        expect(await screen.findAllByText('A great story')).toHaveLength(2);
        expect(screen.queryByRole('status')).toBeNull();
        expect(container.querySelector('.main-content.item-details > .item')).toBeInTheDocument();
    });

    it('scrolls to the top on mount, also while loading', () => {
        mockFetch({ [apiUrls.item(42)]: () => deferred().promise });
        renderItem();
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('renders title, domain, points, user, time and the comment label like Angular', async () => {
        const { container } = (mockFetch({ [apiUrls.item(42)]: story({ comments_count: 7 }) }), renderItem());
        await screen.findAllByText('A great story');
        const laptop = container.querySelector('.laptop') as HTMLElement;
        expect(laptop).toHaveClass('item-header');
        const title = within(laptop).getByRole('link', { name: 'A great story' });
        expect(title).toHaveAttribute('href', 'https://example.com/post');
        expect(title).not.toHaveAttribute('target');
        expect(laptop.querySelector('p')!.textContent).toBe('A great story (example.com)');
        const subtext = laptop.querySelector('.subtext') as HTMLElement;
        expect(subtext.textContent).toBe('128 points by pg 3 hours ago | 7 comments');
        expect(within(subtext).getByRole('link', { name: 'pg' })).toHaveAttribute('href', '/user/pg');
        expect(within(subtext).getByRole('link', { name: '7 comments' })).toHaveAttribute('href', '/item/42');
        expect(subtext.querySelector('.item-details')).toHaveTextContent('3 hours ago');
        expect(container.querySelector('.mobile.item-header .title-block .title')).toHaveTextContent('A great story');
        expect(container.querySelectorAll('ul.comment-list > li .app-comment')).toHaveLength(1);
    });

    it.each([
        [0, 'discuss'],
        [1, '1 comment'],
    ])('labels %i comments as "%s" (Angular comment pipe)', async (count, label) => {
        mockFetch({ [apiUrls.item(42)]: story({ comments_count: count, comments: [] }) });
        const { container } = renderItem();
        await screen.findAllByText('A great story');
        expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
        expect(container.querySelector('.laptop')!.classList.contains('item-header')).toBe(count > 0);
    });

    it('opens external title links in a new tab when openLinkInNewTab is set', async () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        mockFetch({ [apiUrls.item(42)]: story() });
        renderItem();
        const titles = await screen.findAllByRole('link', { name: 'A great story' });
        for (const title of titles) {
            expect(title).toHaveAttribute('target', '_blank');
            expect(title).toHaveAttribute('rel', 'noopener noreferrer');
        }
    });

    it('renders Ask HN posts with an internal title link and sanitized content', async () => {
        mockFetch({
            [apiUrls.item(42)]: story({
                title: 'Ask HN: Anything?',
                url: 'item?id=42',
                domain: undefined,
                content:
                    '<p>Question <a href="item?id=7" onclick="x()">see</a></p><img src=x onerror="alert(1)"><script>bad()</script>',
            }),
        });
        const { container } = renderItem();
        const titles = await screen.findAllByRole('link', { name: 'Ask HN: Anything?' });
        for (const title of titles) {
            expect(title).toHaveAttribute('href', '/item/42');
            expect(title).toHaveClass('title', 'active');
        }
        expect(container.querySelector('.domain')).toBeNull();
        const subject = container.querySelector('p.subject')!;
        expect(subject).toHaveTextContent('Question see');
        expect(subject.querySelector('script, img, [onclick], [onerror]')).toBeNull();
        expect(subject.querySelector('a')).toHaveAttribute('href', 'https://news.ycombinator.com/item?id=7');
    });

    it('renders jobs without points, user or comments link', async () => {
        mockFetch({
            [apiUrls.item(42)]: story({ type: 'job', points: null as never, user: null as never, comments_count: 0 }),
        });
        const { container } = renderItem();
        await screen.findAllByText('A great story');
        const laptop = container.querySelector('.laptop')!;
        expect(laptop).toHaveClass('item-header');
        expect(laptop.querySelector('.subtext')!.textContent).toBe(' 3 hours ago');
        expect(laptop.querySelector('.item-details')).toBeNull();
        expect(screen.queryByText(/points by/)).toBeNull();
        expect(screen.queryByRole('link', { name: 'discuss' })).toBeNull();
    });

    it('renders poll options with points and proportional vote bars', async () => {
        mockFetch({
            [apiUrls.item(42)]: story({
                type: 'poll',
                url: 'item?id=42',
                poll: [
                    { item: 'A', points: 1 },
                    { item: 'B', points: 1 },
                ] as never,
            }),
            [apiUrls.item(43)]: { id: 43, type: 'pollopt', content: '<b>Yes</b>', points: 30 },
            [apiUrls.item(44)]: { id: 44, type: 'pollopt', content: 'No<script>x()</script>', points: 10 },
        });
        const { container } = renderItem();
        await screen.findAllByText('A great story');
        const options = container.querySelectorAll('.pollResults > .pollContent');
        expect(options).toHaveLength(2);
        expect(options[0].querySelector('b')).toHaveTextContent('Yes');
        expect(options[0].querySelector('.subtext')).toHaveTextContent('30 points');
        expect((options[0].querySelector('.pollBar') as HTMLElement).style.width).toBe('75%');
        expect((options[1].querySelector('.pollBar') as HTMLElement).style.width).toBe('25%');
        expect(options[1].querySelector('script')).toBeNull();
    });

    it('guards the vote bars against a poll with no votes', async () => {
        mockFetch({
            [apiUrls.item(42)]: story({ type: 'poll', poll: [{ item: 'A', points: 0 }] as never }),
            [apiUrls.item(43)]: { id: 43, type: 'pollopt', content: 'Only', points: 0 },
        });
        const { container } = renderItem();
        await screen.findAllByText('A great story');
        expect((container.querySelector('.pollBar') as HTMLElement).style.width).toBe('0%');
    });

    it.each([
        ['an unknown item (node-hnapi 200 + error body)', 999, { error: 'Item 999 not found' }],
        ['a server error', 42, textResponse('boom', 404)],
    ])('shows Angular’s error for %s', async (_name, id, response) => {
        mockFetch({ [apiUrls.item(id)]: response });
        renderItem(id);
        expect(await screen.findByRole('alert')).toHaveTextContent('Could not load item comments.');
        expect(screen.queryByRole('status')).toBeNull();
    });

    it.each(['abc', '0', '-5', '1.5'])('shows the error for the invalid id /item/%s without a request', async (id) => {
        const handle = mockFetch();
        renderItem(id);
        expect(await screen.findByRole('alert')).toHaveTextContent('Could not load item comments.');
        expect(handle.calls).toHaveLength(0);
    });

    it('goes back with the back button (click, Enter and Space)', async () => {
        mockFetch({ [apiUrls.item(42)]: story() });
        function Start() {
            const navigate = useNavigate();
            return (
                <button type="button" onClick={() => void navigate('/item/42')}>
                    open
                </button>
            );
        }
        const { user } = renderWithProviders(<Start />, {
            route: '/start',
            path: '/start',
            otherRoutes: { '/item/:id': <ItemDetails /> },
        });
        const openItem = async () => {
            await user.click(screen.getByRole('button', { name: 'open' }));
            return screen.findByRole('button', { name: 'Back' });
        };

        await user.click(await openItem());
        await waitFor(() => expect(screen.getByRole('button', { name: 'open' })).toBeInTheDocument());

        const back = await openItem();
        expect(back).toHaveClass('back-button');
        expect(back).toHaveAttribute('tabindex', '0');
        back.focus();
        await user.keyboard('{Enter}');
        await waitFor(() => expect(screen.getByRole('button', { name: 'open' })).toBeInTheDocument());

        (await openItem()).focus();
        await user.keyboard(' ');
        await waitFor(() => expect(screen.getByRole('button', { name: 'open' })).toBeInTheDocument());
    });

    it('links to the poster’s profile', async () => {
        mockFetch({ [apiUrls.item(42)]: story() });
        const { container, user } = renderItem(42, { '/user/:id': <p>user page</p> });
        await screen.findAllByText('A great story');
        await user.click(within(container.querySelector('.subtext') as HTMLElement).getByRole('link', { name: 'pg' }));
        expect(screen.getByText('user page')).toBeInTheDocument();
    });
});
