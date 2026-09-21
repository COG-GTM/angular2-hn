import { screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ItemDetails } from './ItemDetails';
import type { Story } from '../models';
import { mockMatchMedia, renderWithProviders } from '../test/utils';

function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 100,
        title: 'A React story',
        points: 42,
        user: 'alice',
        time: 0,
        time_ago: 0,
        type: 'story',
        url: 'https://example.com/post',
        domain: 'example.com',
        comments: [],
        comments_count: 1,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
        content: '<p>story text</p>',
        ...overrides,
    } as Story;
}

function mockJson(payloads: unknown[]) {
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    payloads.forEach((payload) => {
        fetchMock.mockResolvedValueOnce({ json: async () => payload } as Response);
    });
    return fetchMock;
}

function renderItem(route = '/item/100') {
    return renderWithProviders(
        <Routes>
            <Route path="/item/:id" element={<ItemDetails />} />
        </Routes>,
        { route }
    );
}

beforeEach(() => {
    localStorage.clear();
    mockMatchMedia(false);
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('ItemDetails', () => {
    it('shows the loader while the item is loading', () => {
        vi.spyOn(globalThis, 'fetch').mockReturnValue(new Promise(() => {}) as Promise<Response>);

        const { container } = renderItem();

        expect(container.querySelector('.loader')).toBeInTheDocument();
    });

    it('renders the title, domain, subtext and comment tree', async () => {
        mockJson([
            makeStory({
                comments: [
                    {
                        id: 5,
                        level: 0,
                        user: 'bob',
                        time: 0,
                        time_ago: '2 hours ago',
                        content: '<p>nice post</p>',
                        deleted: false,
                        comments: [],
                    },
                ],
            }),
        ]);

        const { container } = renderItem();

        const titles = await screen.findAllByRole('link', { name: 'A React story' });
        expect(titles[0]).toHaveAttribute('href', 'https://example.com/post');
        expect(screen.getByText('(example.com)')).toBeInTheDocument();
        expect(screen.getByText(/42 points by/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: '1 comment' })).toBeInTheDocument();
        expect(container.querySelector('.subject')).toHaveTextContent('story text');
        expect(screen.getByText('nice post')).toBeInTheDocument();
    });

    it('links internally when the item has no external url', async () => {
        mockJson([makeStory({ url: 'item?id=100', domain: '' })]);

        const { container } = renderItem();

        const titles = await screen.findAllByRole('link', { name: 'A React story' });
        titles.forEach((title) => expect(title).toHaveAttribute('href', '/item/100'));
        expect(container.querySelector('.domain')).toBeNull();
    });

    it('renders poll options with vote counts and bar widths', async () => {
        mockJson([
            makeStory({ type: 'poll', poll: [{} as never, {} as never], comments_count: 0 }),
            { points: 30, content: '<p>Option A</p>' },
            { points: 10, content: '<p>Option B</p>' },
        ]);

        const { container } = renderItem();

        expect(await screen.findByText('Option A')).toBeInTheDocument();
        expect(screen.getByText('30 points')).toBeInTheDocument();
        expect(screen.getByText('10 points')).toBeInTheDocument();
        const bars = container.querySelectorAll('.pollBar');
        expect(bars[0]).toHaveStyle({ width: '75%' });
        expect(bars[1]).toHaveStyle({ width: '25%' });
    });

    it('hides the points and comments subtext for jobs', async () => {
        mockJson([makeStory({ type: 'job', comments_count: 0 })]);

        renderItem();

        await screen.findAllByRole('link', { name: 'A React story' });

        expect(screen.queryByText(/points by/)).not.toBeInTheDocument();
    });

    it('shows the error message when the item cannot be loaded', async () => {
        vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));

        renderItem();

        await waitFor(() => expect(screen.getByText('Could not load item comments.')).toBeInTheDocument());
    });

    it('navigates back through browser history and scrolls to top on load', async () => {
        mockJson([makeStory()]);
        const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
        const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

        const { container } = renderItem();

        await screen.findAllByRole('link', { name: 'A React story' });
        expect(scrollTo).toHaveBeenCalledWith(0, 0);

        (container.querySelector('.back-button') as HTMLElement).click();
        expect(back).toHaveBeenCalled();
    });
});
