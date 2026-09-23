import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Story } from '../../models';
import { SettingsProvider } from '../../settings/SettingsContext';
import { ItemDetails } from './ItemDetails';

function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 123,
        title: 'A linked story',
        points: 42,
        user: 'pg',
        time: 1600000000,
        time_ago: '3 hours ago',
        type: 'story',
        url: 'https://example.com/post',
        domain: 'example.com',
        comments: [],
        comments_count: 2,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
        ...overrides,
    };
}

/** Resolves every request with the same payload; poll options are fetched by id too. */
function mockFetch(responder: (url: string) => unknown) {
    const fetchMock = vi.fn((input: string) => Promise.resolve({ json: () => Promise.resolve(responder(input)) }));
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

function renderItem(id = '123') {
    return render(
        <MemoryRouter initialEntries={[`/item/${id}`]}>
            <SettingsProvider>
                <Routes>
                    <Route path="/item/:id" element={<ItemDetails />} />
                </Routes>
            </SettingsProvider>
        </MemoryRouter>
    );
}

beforeEach(() => {
    localStorage.clear();
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('ItemDetails', () => {
    it('shows the loader while the item is being fetched', () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(() => new Promise(() => {}))
        );

        const { container } = renderItem();

        expect(container.querySelector('.loading-section')).toBeInTheDocument();
        expect(container.querySelector('.item')).not.toBeInTheDocument();
    });

    it('shows the Angular error message when the fetch fails', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(() => Promise.reject(new Error('offline')))
        );

        renderItem();

        expect(await screen.findByText('Could not load item comments.')).toBeInTheDocument();
    });

    it('renders the story header, subtext and comment tree', async () => {
        mockFetch(() =>
            makeStory({
                content: '<p>Story body</p>',
                comments: [
                    {
                        id: 9,
                        level: 0,
                        user: 'dang',
                        time: 1600000000,
                        time_ago: '1 hour ago',
                        content: '<p>Nice</p>',
                        deleted: false,
                        comments: [],
                    },
                ],
            })
        );

        const { container } = renderItem();

        const titles = await screen.findAllByRole('link', { name: 'A linked story' });
        expect(titles).toHaveLength(2); // the mobile header and the laptop header, as in the Angular template
        titles.forEach((title) => expect(title).toHaveAttribute('href', 'https://example.com/post'));
        expect(titles[0]).not.toHaveAttribute('target');

        expect(screen.getByText('(example.com)')).toHaveClass('domain');
        expect(container.querySelector('.subtext')).toHaveTextContent('42 points by pg');
        expect(screen.getByText('3 hours ago', { exact: false })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: '2 comments' })).toHaveAttribute('href', '/item/123');
        expect(container.querySelector('.subject')?.innerHTML).toBe('<p>Story body</p>');

        expect(container.querySelectorAll('.comment-list > li')).toHaveLength(1);
        expect(screen.getByRole('link', { name: 'dang' })).toHaveAttribute('href', '/user/dang');
    });

    it('opens the story link in a new tab when the setting is on', async () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        mockFetch(() => makeStory());

        renderItem();

        const [title] = await screen.findAllByRole('link', { name: 'A linked story' });
        expect(title).toHaveAttribute('target', '_blank');
        expect(title).toHaveAttribute('rel', 'noopener');
    });

    it('links a self-post title to its own item route instead of an external url', async () => {
        mockFetch(() => makeStory({ url: 'item?id=123', domain: '' }));

        renderItem();

        const titles = await screen.findAllByRole('link', { name: 'A linked story' });
        titles.forEach((title) => expect(title).toHaveAttribute('href', '/item/123'));
        expect(screen.queryByText('(example.com)')).not.toBeInTheDocument();
    });

    it('omits points, author and the comments link for job items', async () => {
        mockFetch(() => makeStory({ type: 'job', comments_count: 0 }));

        const { container } = renderItem();

        await screen.findAllByRole('link', { name: 'A linked story' });
        expect(container.querySelector('.subtext')).toHaveTextContent('3 hours ago');
        expect(screen.queryByText('pg')).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'discuss' })).not.toBeInTheDocument();
        expect(container.querySelector('.item-details')).not.toBeInTheDocument();
    });

    it('renders poll options with a bar sized by their share of the votes', async () => {
        mockFetch((url) => {
            if (url.endsWith('/item/123')) {
                return makeStory({
                    type: 'poll',
                    poll: [
                        { points: 0, content: '' },
                        { points: 0, content: '' },
                    ],
                });
            }
            return url.endsWith('/item/124')
                ? { points: 30, content: '<p>Option A</p>' }
                : { points: 10, content: '<p>Option B</p>' };
        });

        const { container } = renderItem();

        await waitFor(() => expect(container.querySelectorAll('.pollContent')).toHaveLength(2));
        expect(screen.getByText('Option A')).toBeInTheDocument();
        expect(screen.getByText('30 points')).toHaveClass('subtext');

        const bars = container.querySelectorAll<HTMLElement>('.pollBar');
        expect(bars[0].style.width).toBe('75%');
        expect(bars[1].style.width).toBe('25%');
    });
});
