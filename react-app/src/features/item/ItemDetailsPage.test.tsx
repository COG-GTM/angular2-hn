import { screen, within } from '@testing-library/react';
import { Link } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { apiUrls } from '../../api';
import { STORAGE_KEYS } from '../../context/SettingsContext';
import { deferred, mockFetch, renderWithProviders, textResponse } from '../../test';
import { makeComment, makeStory } from './fixtures';
import { ITEM_ERROR_MESSAGE, ItemDetailsPage } from './ItemDetailsPage';
import { pollBarWidth } from './pollBarWidth';

function renderAt(id: string | number, otherRoutes = {}) {
    return renderWithProviders(<ItemDetailsPage />, { route: `/item/${id}`, path: '/item/:id', otherRoutes });
}

/** The laptop header (the mobile header repeats the title link). */
function laptop(container: HTMLElement) {
    return container.querySelector('.laptop') as HTMLElement;
}

describe('ItemDetailsPage', () => {
    it('shows the loader while loading and scrolls to top', async () => {
        const pending = deferred<unknown>();
        mockFetch({ [apiUrls.item(42)]: () => pending.promise });
        renderAt(42);
        expect(screen.getByTestId('loader-placeholder')).toBeInTheDocument();
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
        pending.resolve(makeStory());
        expect(await screen.findAllByText('A story')).toHaveLength(2);
        expect(screen.queryByTestId('loader-placeholder')).toBeNull();
    });

    it('shows the error message when the request fails', async () => {
        mockFetch({ [apiUrls.item(42)]: textResponse('boom', 500) });
        renderAt(42);
        expect(await screen.findByText(ITEM_ERROR_MESSAGE)).toBeInTheDocument();
    });

    it('shows the error message for an invalid id without requesting', async () => {
        const { calls } = mockFetch();
        renderAt('abc');
        expect(await screen.findByText(ITEM_ERROR_MESSAGE)).toBeInTheDocument();
        expect(calls).toHaveLength(0);
    });

    it('renders an external link story: title, domain, subtext and comment list', async () => {
        mockFetch({
            [apiUrls.item(42)]: makeStory({
                comments_count: 2,
                comments: [makeComment({ id: 1 }), makeComment({ id: 2, user: 'bob', deleted: true })],
            }),
        });
        const { container } = renderAt(42);
        await screen.findAllByText('A story');
        const header = laptop(container);
        expect(header).toHaveClass('item-header');
        const title = within(header).getByRole('link', { name: 'A story' });
        expect(title).toHaveAttribute('href', 'https://example.com/post');
        expect(title).not.toHaveAttribute('target');
        expect(within(header).getByText('(example.com)')).toHaveClass('domain');
        const subtext = header.querySelector('.subtext')!;
        expect(subtext).toHaveTextContent('10 points by pg 3 hours ago | 2 comments');
        expect(within(subtext as HTMLElement).getByRole('link', { name: 'pg' })).toHaveAttribute('href', '/user/pg');
        expect(within(subtext as HTMLElement).getByRole('link', { name: '2 comments' })).toHaveAttribute(
            'href',
            '/item/42'
        );
        expect(container.querySelectorAll('ul.comment-list > li')).toHaveLength(2);
        expect(container.querySelector('.deleted-meta')).toHaveTextContent('[deleted] | Comment Deleted');
    });

    it('opens external titles in a new tab when the setting is on', async () => {
        localStorage.setItem(STORAGE_KEYS.openLinkInNewTab, 'true');
        mockFetch({ [apiUrls.item(42)]: makeStory() });
        const { container } = renderAt(42);
        await screen.findAllByText('A story');
        const title = within(laptop(container)).getByRole('link', { name: 'A story' });
        expect(title).toHaveAttribute('target', '_blank');
        expect(title).toHaveAttribute('rel', 'noopener');
        localStorage.clear();
    });

    it('renders an Ask HN with an internal title link and sanitized content', async () => {
        mockFetch({
            [apiUrls.item(7)]: makeStory({
                id: 7,
                type: 'ask',
                title: 'Ask HN: Why?',
                url: 'item?id=7',
                domain: undefined,
                content: '<p>Body <a href="item?id=1">link</a><img src=x onerror="alert(1)"></p>',
            }),
        });
        const { container } = renderAt(7);
        await screen.findAllByText('Ask HN: Why?');
        const header = laptop(container);
        expect(header).not.toHaveClass('item-header');
        expect(within(header).getByRole('link', { name: 'Ask HN: Why?' })).toHaveAttribute('href', '/item/7');
        expect(header.querySelector('.domain')).toBeNull();
        expect(within(header).getByText('discuss')).toBeInTheDocument();
        const subject = container.querySelector('.subject')!;
        expect(subject).toHaveTextContent('Body link');
        expect(subject.innerHTML).not.toMatch(/img|onerror/);
        expect(within(subject as HTMLElement).getByRole('link', { name: 'link' })).toHaveAttribute(
            'href',
            'https://news.ycombinator.com/item?id=1'
        );
    });

    it('renders a job without points/user/comments', async () => {
        mockFetch({
            [apiUrls.item(9)]: makeStory({ id: 9, type: 'job', title: 'Acme is hiring', points: 0, user: '' }),
        });
        const { container } = renderAt(9);
        await screen.findAllByText('Acme is hiring');
        const header = laptop(container);
        expect(header).toHaveClass('item-header');
        const subtext = header.querySelector('.subtext')!;
        expect(subtext).toHaveTextContent(/^3 hours ago$/);
        expect(subtext.querySelector('.item-details')).toBeNull();
        expect(within(subtext as HTMLElement).queryByRole('link')).toBeNull();
    });

    it('renders poll results with width-percentage bars', async () => {
        mockFetch({
            [apiUrls.item(100)]: makeStory({
                id: 100,
                type: 'poll',
                url: 'item?id=100',
                poll: [{ item: 101 }, { item: 102 }] as never,
            }),
            [apiUrls.item(101)]: { points: 1, content: '<p>Yes</p>' },
            [apiUrls.item(102)]: { points: 3, content: '<p>No</p>' },
        });
        const { container } = renderAt(100);
        await screen.findByText('Yes');
        const options = container.querySelectorAll('.pollResults > .pollContent');
        expect(options).toHaveLength(2);
        expect(options[1]).toHaveTextContent('No');
        expect(within(options[1] as HTMLElement).getByText('3 points')).toHaveClass('subtext');
        const bars = screen.getAllByTestId('poll-bar');
        expect(bars[0]).toHaveStyle({ width: '25%' });
        expect(bars[1]).toHaveStyle({ width: '75%' });
    });

    it('guards poll_votes_count === 0', () => {
        expect(pollBarWidth(0, 0)).toBe('0%');
        expect(pollBarWidth(5, undefined)).toBe('0%');
        expect(pollBarWidth(1, 4)).toBe('25%');
    });

    it('back button navigates back (click and keyboard)', async () => {
        mockFetch({ [apiUrls.item(42)]: makeStory() });
        const { user } = renderWithProviders(<ItemDetailsPage />, {
            route: '/news/1',
            path: '/item/:id',
            otherRoutes: { '/news/:page': <Link to="/item/42">open item</Link> },
        });
        await user.click(screen.getByRole('link', { name: 'open item' }));
        await screen.findAllByText('A story');
        await user.click(screen.getByRole('button', { name: 'Go back' }));
        expect(await screen.findByRole('link', { name: 'open item' })).toBeInTheDocument();

        await user.click(screen.getByRole('link', { name: 'open item' }));
        await screen.findAllByText('A story');
        const back = screen.getByRole('button', { name: 'Go back' });
        expect(back).toHaveClass('back-button');
        back.focus();
        await user.keyboard('{Enter}');
        expect(await screen.findByRole('link', { name: 'open item' })).toBeInTheDocument();
    });

    it('fetches the new item when the id changes', async () => {
        const { callsTo } = mockFetch({
            [apiUrls.item(42)]: makeStory({
                comments: [makeComment({ id: 1, content: '<p>see <a href="/item/43">other</a></p>' })],
            }),
            [apiUrls.item(43)]: makeStory({ id: 43, title: 'Other story' }),
        });
        const { user } = renderWithProviders(
            <>
                <Link to="/item/43">go to 43</Link>
                <ItemDetailsPage />
            </>,
            { route: '/item/42', path: '/item/:id' }
        );
        await screen.findAllByText('A story');
        vi.mocked(window.scrollTo).mockClear();
        await user.click(screen.getByRole('link', { name: 'go to 43' }));
        expect(await screen.findAllByText('Other story')).toHaveLength(2);
        expect(screen.queryByText('A story')).toBeNull();
        expect(callsTo(apiUrls.item(43))).toHaveLength(1);
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });
});
