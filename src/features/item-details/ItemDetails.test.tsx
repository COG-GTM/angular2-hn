import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';

import { apiUrls } from '../../shared/api';
import { SettingsProvider } from '../../shared/settings';
import {
    createTestQueryClient,
    deferred,
    jsonResponse,
    mockFetch,
    renderWithProviders,
    textResponse,
} from '../../shared/test-utils';
import { makeComment, makeStory } from './fixtures';
import { ItemDetails } from './ItemDetails';

const ERROR_TEXT = 'Could not load item comments.';

function renderItem(id: number | string = 1, otherRoutes = {}) {
    return renderWithProviders(<ItemDetails />, { route: `/item/${id}`, path: '/item/:id', otherRoutes });
}

/** The `.laptop` header; titles are rendered twice (`.mobile` + `.laptop`). */
function laptop(container: HTMLElement) {
    return container.querySelector<HTMLElement>('.laptop')!;
}

/** Waits for the item to render, then returns the named link in the `.laptop` header. */
async function findLaptopLink(container: HTMLElement, name: string) {
    const lap = await waitFor(() => {
        const el = laptop(container);
        expect(el).toBeTruthy();
        return el;
    });
    return within(lap).getByRole('link', { name });
}

describe('ItemDetails', () => {
    it('shows the loader while the item is loading, then the item', async () => {
        const pending = deferred<Response>();
        mockFetch({ [apiUrls.item(1)]: () => pending.promise });
        const { container } = renderItem(1);

        expect(screen.getByTestId('item-details')).toHaveClass('main-content', 'item-details');
        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(container.querySelector('.item')).toBeNull();

        pending.resolve(jsonResponse(makeStory()));
        expect(await findLaptopLink(container, 'A great story')).toBeInTheDocument();
        expect(screen.queryByRole('status')).toBeNull();
    });

    it('scrolls to the top on mount', () => {
        mockFetch({ [apiUrls.item(1)]: makeStory() });
        renderItem(1);
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it.each([
        ['an HTTP 404', textResponse('Not found', 404)],
        ['an HTTP 500', textResponse('Server error', 500)],
        ['node-hnapi "not found" error body (HTTP 200)', jsonResponse({ error: 'Item 999999999 not found' })],
        ['a null body', jsonResponse(null)],
        ['a non-JSON body', textResponse('oops')],
    ])('shows the Angular error message for %s', async (_label, response) => {
        mockFetch({ [apiUrls.item(999999999)]: response });
        renderItem(999999999);

        expect(await screen.findByRole('alert')).toHaveTextContent(ERROR_TEXT);
        expect(screen.queryByRole('status')).toBeNull();
    });

    it.each(['abc', '0', '-1', '1.5'])('treats the invalid id %s as an error without fetching', async (id) => {
        const api = mockFetch();
        renderItem(id);

        expect(await screen.findByRole('alert')).toHaveTextContent(ERROR_TEXT);
        expect(api.calls).toHaveLength(0);
    });

    it('renders a link story: external title, domain, subtext and comment tree', async () => {
        mockFetch({
            [apiUrls.item(1)]: makeStory({
                comments_count: 2,
                comments: [makeComment({ comments: [makeComment({ id: 102, user: 'bob', content: 'reply' })] })],
            }),
        });
        const { container } = renderItem(1);
        const header = await screen.findByText('3 hours ago', { exact: false });

        const lap = laptop(container);
        expect(lap).toHaveClass('laptop', 'item-header');
        const title = within(lap).getByRole('link', { name: 'A great story' });
        expect(title).toHaveClass('title');
        expect(title).toHaveAttribute('href', 'https://example.com/story');
        expect(title).not.toHaveAttribute('target');
        expect(title).not.toHaveAttribute('rel');
        expect(lap.querySelector('.domain')).toHaveTextContent('(example.com)');
        expect(lap.querySelector('p')).toHaveTextContent('A great story (example.com)');

        const subtext = lap.querySelector('.subtext')!;
        expect(subtext).toHaveTextContent('42 points by pg 3 hours ago | 2 comments');
        expect(within(subtext as HTMLElement).getByRole('link', { name: 'pg' })).toHaveAttribute('href', '/user/pg');
        expect(within(subtext as HTMLElement).getByRole('link', { name: '2 comments' })).toHaveAttribute(
            'href',
            '/item/1'
        );
        expect(header.closest('span')).toHaveClass('item-details');

        const mobile = container.querySelector('.mobile.item-header')!;
        expect(within(mobile as HTMLElement).getByRole('link', { name: 'A great story' })).toHaveAttribute(
            'href',
            'https://example.com/story'
        );
        expect(within(mobile as HTMLElement).getByRole('button', { name: 'Back' })).toHaveClass('back-button');

        expect(container.querySelectorAll('ul.comment-list > li')).toHaveLength(1);
        expect(screen.getAllByTestId('comment')).toHaveLength(2);
        expect(screen.getByText('reply')).toBeInTheDocument();
    });

    it('labels zero comments "discuss" and omits item-header on the laptop header', async () => {
        mockFetch({ [apiUrls.item(1)]: makeStory({ comments_count: 0 }) });
        const { container } = renderItem(1);

        expect(await screen.findByRole('link', { name: 'discuss' })).toHaveAttribute('href', '/item/1');
        expect(laptop(container)).not.toHaveClass('item-header');
    });

    it('labels one comment "1 comment"', async () => {
        mockFetch({ [apiUrls.item(1)]: makeStory({ comments_count: 1 }) });
        renderItem(1);
        expect(await screen.findByRole('link', { name: '1 comment' })).toBeInTheDocument();
    });

    it('opens the external title in a new tab when openLinkInNewTab is set', async () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        mockFetch({ [apiUrls.item(1)]: makeStory() });
        const { container } = renderItem(1);

        await findLaptopLink(container, 'A great story');
        for (const link of screen.getAllByRole('link', { name: 'A great story' })) {
            expect(link).toHaveAttribute('target', '_blank');
            expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        }
    });

    it('renders an Ask/text post with an internal title link and sanitized content', async () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        mockFetch({
            [apiUrls.item(5)]: makeStory({
                id: 5,
                type: 'ask',
                title: 'Ask HN: Something?',
                url: 'item?id=5',
                domain: undefined,
                content:
                    '<p>Body text <a href="https://example.org" target="_blank">link</a></p>' +
                    '<p><img src=x onerror="alert(1)"><a href="javascript:alert(1)">bad</a></p>',
            }),
        });
        const { container } = renderItem(5);

        const title = await findLaptopLink(container, 'Ask HN: Something?');
        expect(title).toHaveAttribute('href', '/item/5');
        expect(title).not.toHaveAttribute('target');
        expect(container.querySelector('.domain')).toBeNull();

        const subject = container.querySelector('p.subject')!;
        expect(subject).toHaveTextContent('Body text link');
        expect(subject.querySelector('img')).toBeNull();
        expect(subject.innerHTML).not.toMatch(/onerror|javascript:/i);
        const link = within(subject as HTMLElement).getByRole('link', { name: 'link' });
        expect(link).toHaveAttribute('href', 'https://example.org');
        expect(link).toHaveAttribute('rel', 'nofollow noopener noreferrer');
        expect(link).not.toHaveAttribute('target');
    });

    it('renders a job without points, user or comments link', async () => {
        mockFetch({
            [apiUrls.item(7)]: makeStory({
                id: 7,
                type: 'job',
                title: 'Acme is hiring',
                url: 'https://acme.dev/jobs',
                domain: 'acme.dev',
                points: null as unknown as number,
                user: null as unknown as string,
            }),
        });
        const { container } = renderItem(7);

        const lap = await waitFor(() => {
            const el = laptop(container);
            expect(el).toBeTruthy();
            return el;
        });
        expect(lap).toHaveClass('item-header');
        const subtext = lap.querySelector('.subtext')!;
        expect(subtext).toHaveTextContent(/^3 hours ago$/);
        expect(subtext.querySelector('.item-details')).toBeNull();
        expect(within(subtext as HTMLElement).queryByRole('link')).toBeNull();
    });

    it('renders poll results with sanitized options, points and proportional bars', async () => {
        mockFetch({
            [apiUrls.item(10)]: makeStory({
                id: 10,
                type: 'poll',
                url: 'item?id=10',
                poll: [
                    { item: 'A', points: 1 },
                    { item: 'B', points: 1 },
                ] as never,
            }),
            [apiUrls.item(11)]: { points: 30, content: '<p>Option A</p><script>x()</script>' },
            [apiUrls.item(12)]: { points: 10, content: '<p>Option B</p>' },
        });
        const { container } = renderItem(10);

        await screen.findByText('Option A');
        const options = container.querySelectorAll<HTMLElement>('.pollResults .pollContent');
        expect(options).toHaveLength(2);
        expect(options[0].querySelector('script')).toBeNull();
        expect(options[0].querySelector('.subtext')).toHaveTextContent('30 points');
        expect(options[0].querySelector<HTMLElement>('.pollBar')!.style.width).toBe('75%');
        expect(options[1].querySelector('.subtext')).toHaveTextContent('10 points');
        expect(options[1].querySelector<HTMLElement>('.pollBar')!.style.width).toBe('25%');
    });

    it('guards poll bars against a zero vote total', async () => {
        mockFetch({
            [apiUrls.item(10)]: makeStory({ id: 10, type: 'poll', url: 'item?id=10', poll: [{ item: 'A' }] as never }),
            [apiUrls.item(11)]: { points: 0, content: 'Nobody' },
        });
        const { container } = renderItem(10);

        await screen.findByText('Nobody');
        expect(container.querySelector<HTMLElement>('.pollBar')!.style.width).toBe('0%');
        expect(container.querySelector('.pollResults')!.innerHTML).not.toMatch(/NaN|Infinity/);
    });

    it('does not render poll results for non-poll items', async () => {
        mockFetch({ [apiUrls.item(1)]: makeStory() });
        const { container } = renderItem(1);
        await findLaptopLink(container, 'A great story');
        expect(container.querySelector('.pollResults')).toBeNull();
    });

    it('navigates to the user profile from the subtext', async () => {
        mockFetch({ [apiUrls.item(1)]: makeStory() });
        const { user } = renderItem(1, { '/user/:id': <p>user page</p> });

        await user.click(await screen.findByRole('link', { name: 'pg' }));
        expect(screen.getByText('user page')).toBeInTheDocument();
    });

    it('never shows the previous item while a new navigation is loading', async () => {
        let call = 0;
        const second = deferred<Response>();
        mockFetch({
            [apiUrls.item(5)]: () => {
                call += 1;
                return call === 1 ? makeStory({ id: 5, url: 'item?id=5', title: 'First' }) : second.promise;
            },
        });
        const { user, container } = renderItem(5);

        await user.click(await findLaptopLink(container, 'First'));
        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.queryByText('First')).toBeNull();

        second.resolve(jsonResponse(makeStory({ id: 5, url: 'item?id=5', title: 'Second' })));
        expect(await findLaptopLink(container, 'Second')).toBeInTheDocument();
        expect(call).toBe(2);
    });

    it('goes back in history from the back button (click, Enter, Space)', async () => {
        mockFetch({ [apiUrls.item(1)]: makeStory() });
        const user = userEvent.setup();

        for (const action of ['click', '{Enter}', ' '] as const) {
            const { unmount } = render(
                <QueryClientProvider client={createTestQueryClient()}>
                    <SettingsProvider>
                        <MemoryRouter initialEntries={['/news/1', '/item/1']} initialIndex={1}>
                            <Routes>
                                <Route path="/news/:page" element={<p>feed page</p>} />
                                <Route path="/item/:id" element={<ItemDetails />} />
                            </Routes>
                        </MemoryRouter>
                    </SettingsProvider>
                </QueryClientProvider>
            );
            const back = await screen.findByRole('button', { name: 'Back' });
            expect(back).toHaveAttribute('tabindex', '0');
            if (action === 'click') {
                await user.click(back);
            } else {
                back.focus();
                await user.keyboard(action);
            }
            expect(await screen.findByText('feed page')).toBeInTheDocument();
            unmount();
        }
    });
});
