import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mockMatchMedia } from '../test/matchMedia';
import { fetchItemContent } from '../api/hackernews-api';
import type { Story } from '../models';
import { SettingsProvider } from '../settings';
import { ItemDetails } from '.';

vi.mock('../api/hackernews-api');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

type Item = Story & { content?: string; text?: string };

function makeStory(overrides: Partial<Item> = {}): Item {
    return {
        id: 100,
        title: 'A story',
        points: 42,
        user: 'pg',
        time: 0,
        time_ago: 0,
        type: 'story',
        url: 'https://example.com/post',
        domain: 'example.com',
        comments: [],
        comments_count: 3,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
        ...overrides,
    };
}

function renderItem(id = '100') {
    return render(
        <SettingsProvider>
            <MemoryRouter initialEntries={[`/item/${id}`]}>
                <Routes>
                    <Route path="/item/:id" element={<ItemDetails />} />
                </Routes>
            </MemoryRouter>
        </SettingsProvider>
    );
}

describe('ItemDetails', () => {
    beforeEach(() => {
        localStorage.clear();
        mockMatchMedia();
        window.scrollTo = vi.fn();
        mockNavigate.mockReset();
        vi.mocked(fetchItemContent).mockReset();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('shows the loader while loading and fetches the numeric id', () => {
        vi.mocked(fetchItemContent).mockReturnValue(new Promise(() => {}));
        renderItem('123');
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(fetchItemContent).toHaveBeenCalledWith(123, expect.any(AbortSignal));
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('shows the error message when the request fails', async () => {
        vi.mocked(fetchItemContent).mockRejectedValue(new Error('boom'));
        renderItem();
        expect(await screen.findByText('Could not load item comments.')).toBeInTheDocument();
        expect(screen.queryByText('Loading...')).toBeNull();
    });

    it('ignores results and errors after unmount (abort)', async () => {
        let reject: (reason: Error) => void = () => {};
        vi.mocked(fetchItemContent).mockImplementation(
            () =>
                new Promise<Story>((_, rej) => {
                    reject = rej;
                })
        );
        const { unmount } = renderItem();
        const signal = vi.mocked(fetchItemContent).mock.calls[0][1] as AbortSignal;
        unmount();
        expect(signal.aborted).toBe(true);
        reject(new Error('late'));
        await Promise.resolve();
        expect(screen.queryByText('Could not load item comments.')).toBeNull();
    });

    it('ignores a resolved story after abort', async () => {
        let resolve: (story: Story) => void = () => {};
        vi.mocked(fetchItemContent).mockImplementation(
            () =>
                new Promise<Story>((res) => {
                    resolve = res;
                })
        );
        const { unmount } = renderItem();
        unmount();
        resolve(makeStory());
        await Promise.resolve();
        expect(screen.queryByText('A story')).toBeNull();
    });

    it('renders a story with url in the same tab by default', async () => {
        vi.mocked(fetchItemContent).mockResolvedValue(makeStory({ text: 'has text' }));
        const { container } = renderItem();
        const titles = await screen.findAllByText('A story');
        expect(titles).toHaveLength(2);
        for (const title of titles) {
            expect(title).toHaveAttribute('href', 'https://example.com/post');
            expect(title).not.toHaveAttribute('target');
            expect(title).not.toHaveAttribute('rel');
        }
        expect(screen.getByText('(example.com)')).toHaveClass('domain');
        expect(screen.getByText('pg')).toHaveAttribute('href', '/user/pg');
        expect(screen.getByText('3 comments')).toHaveAttribute('href', '/item/100');
        expect(container.querySelector('.laptop')).toHaveClass('item-header');
        expect(container.querySelector('.laptop')).toHaveClass('head-margin');
        expect(container.querySelector('.subtext > span:last-child')).toHaveClass('item-details');
        expect(container.querySelector('.subject')?.innerHTML).toBe('');
    });

    it('opens external links in a new tab when the setting is enabled', async () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        vi.mocked(fetchItemContent).mockResolvedValue(makeStory());
        renderItem();
        const titles = await screen.findAllByText('A story');
        for (const title of titles) {
            expect(title).toHaveAttribute('target', '_blank');
            expect(title).toHaveAttribute('rel', 'noopener');
        }
    });

    it('renders a story without url as internal links and renders content html', async () => {
        vi.mocked(fetchItemContent).mockResolvedValue(
            makeStory({
                url: 'item?id=100',
                domain: '',
                comments_count: 0,
                content: '<b>Ask HN body</b>',
            })
        );
        const { container } = renderItem();
        const titles = await screen.findAllByText('A story');
        expect(titles).toHaveLength(2);
        for (const title of titles) {
            expect(title).toHaveAttribute('href', '/item/100');
        }
        expect(screen.queryByText(/\(/)).toBeNull();
        expect(screen.getByText('discuss')).toHaveAttribute('href', '/item/100');
        expect(container.querySelector('.laptop')).not.toHaveClass('item-header');
        expect(container.querySelector('.laptop')).not.toHaveClass('head-margin');
        expect(container.querySelector('.subject')?.innerHTML).toBe('<b>Ask HN body</b>');
    });

    it('hides the domain when the story has a url but no domain', async () => {
        vi.mocked(fetchItemContent).mockResolvedValue(makeStory({ domain: '' }));
        const { container } = renderItem();
        await screen.findAllByText('A story');
        expect(container.querySelector('.domain')).toBeNull();
    });

    it('renders a job without points, user or comment link', async () => {
        vi.mocked(fetchItemContent).mockResolvedValue(
            makeStory({ type: 'job', comments_count: 0, time_ago: 5, user: 'hiring' })
        );
        const { container } = renderItem();
        await screen.findAllByText('A story');
        expect(screen.queryByText(/points by/)).toBeNull();
        expect(screen.queryByText('hiring')).toBeNull();
        expect(screen.queryByText('discuss')).toBeNull();
        expect(container.querySelector('.laptop')).toHaveClass('item-header');
        const timeSpan = container.querySelector('.subtext > span') as HTMLElement;
        expect(timeSpan).not.toHaveClass('item-details');
        expect(timeSpan.textContent).toBe('5');
    });

    it('renders poll results with bar widths computed from votes', async () => {
        vi.mocked(fetchItemContent).mockResolvedValue(
            makeStory({
                type: 'poll',
                url: 'item?id=100',
                poll: [
                    { points: 5, content: '<p>Option A</p>' },
                    { points: 8, content: '<p>Option B</p>' },
                ],
                poll_votes_count: 13,
            })
        );
        const { container } = renderItem();
        await screen.findAllByText('A story');
        const options = container.querySelectorAll('.pollResults .pollContent');
        expect(options).toHaveLength(2);
        expect(options[0].querySelector('div')?.innerHTML).toBe('<p>Option A</p>');
        expect(options[0].querySelector('.subtext')).toHaveTextContent('5 points');
        expect((options[0].querySelector('.pollBar') as HTMLElement).style.width).toBe(`${(5 / 13) * 100}%`);
        expect((options[1].querySelector('.pollBar') as HTMLElement).style.width).toBe(`${(8 / 13) * 100}%`);
        expect((options[0].querySelector('.pollBar') as HTMLElement).style.width).toMatch(/^38\.46/);
    });

    it('does not render poll results for non-poll items', async () => {
        vi.mocked(fetchItemContent).mockResolvedValue(makeStory());
        const { container } = renderItem();
        await screen.findAllByText('A story');
        expect(container.querySelector('.pollResults')).toBeNull();
    });

    it('navigates back when the back button is clicked', async () => {
        const user = userEvent.setup();
        vi.mocked(fetchItemContent).mockResolvedValue(makeStory());
        const { container } = renderItem();
        await screen.findAllByText('A story');
        await user.click(container.querySelector('.back-button') as HTMLElement);
        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('renders the comment tree', async () => {
        vi.mocked(fetchItemContent).mockResolvedValue(
            makeStory({
                comments: [
                    {
                        id: 1,
                        level: 0,
                        user: 'alice',
                        time: 0,
                        time_ago: '1 hour ago',
                        content: 'first',
                        deleted: false,
                        comments: [
                            {
                                id: 2,
                                level: 1,
                                user: 'bob',
                                time: 0,
                                time_ago: '30 minutes ago',
                                content: 'reply',
                                deleted: false,
                                comments: [],
                            },
                        ],
                    },
                    { id: 3, level: 0, user: '', time: 0, time_ago: '', content: '', deleted: true, comments: [] },
                ],
            })
        );
        const { container } = renderItem();
        await screen.findAllByText('A story');
        await waitFor(() => expect(screen.getByText('first')).toBeInTheDocument());
        expect(screen.getByText('reply')).toBeInTheDocument();
        expect(container.querySelectorAll('.comment-list > li')).toHaveLength(2);
        expect(screen.getByText('[deleted]')).toBeInTheDocument();
    });
});
