import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsProvider } from '../context/SettingsContext';
import type { Comment } from '../models/comment';
import type { Story } from '../models/story';
import ItemDetails from './ItemDetails';

function makeItem(overrides: Partial<Story> = {}): Story {
    return {
        id: 10,
        title: 'Ask HN: anything?',
        points: 5,
        user: 'pg',
        time: 0,
        time_ago: '3 hours ago',
        type: 'story',
        url: 'item?id=10',
        domain: '',
        content: '<p>Body copy</p>',
        text: '',
        comments: [],
        comments_count: 1,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
        ...overrides,
    };
}

function makeComment(overrides: Partial<Comment> = {}): Comment {
    return {
        id: 11,
        level: 0,
        user: 'kid',
        time: 0,
        time_ago: '1 hour ago',
        content: 'Nested content',
        deleted: false,
        comments: [],
        ...overrides,
    };
}

function stubFetch(payloads: unknown[]) {
    const fetchMock = vi.fn(async () => {
        const payload = payloads.shift();
        return { ok: true, status: 200, json: async () => payload } as Response;
    });

    vi.stubGlobal('fetch', fetchMock);

    return fetchMock;
}

function renderItemDetails() {
    return render(
        <MemoryRouter initialEntries={['/news/1', '/item/10']} initialIndex={1}>
            <SettingsProvider>
                <Routes>
                    <Route path="item/:id" element={<ItemDetails />} />
                    <Route path="*" element={<span>elsewhere</span>} />
                </Routes>
            </SettingsProvider>
        </MemoryRouter>
    );
}

beforeEach(() => localStorage.clear());
afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

describe('ItemDetails', () => {
    it('renders the item body and its comments', async () => {
        stubFetch([makeItem({ comments: [makeComment()] })]);
        const { container } = renderItemDetails();

        await waitFor(() => expect(container.querySelector('.subject')?.innerHTML).toBe('<p>Body copy</p>'));
        expect(screen.getByText('Nested content')).toBeTruthy();
        expect(screen.getAllByText('1 comment').length).toBe(1);
    });

    it('renders poll results sized by their share of the votes', async () => {
        stubFetch([
            makeItem({ type: 'poll', poll: [{ points: 0, content: 'A' }, { points: 0, content: 'B' }] }),
            { points: 30, content: 'Option A' },
            { points: 10, content: 'Option B' },
        ]);
        const { container } = renderItemDetails();

        await waitFor(() => expect(screen.getByText('Option A')).toBeTruthy());
        expect(screen.getByText('30 points')).toBeTruthy();
        expect(container.querySelectorAll<HTMLElement>('.pollBar')[0].style.width).toBe('75%');
    });

    it('navigates back from the mobile back button', async () => {
        stubFetch([makeItem()]);
        const { container } = renderItemDetails();

        await waitFor(() => expect(container.querySelector('.back-button')).toBeTruthy());
        fireEvent.click(container.querySelector('.back-button') as HTMLElement);

        await waitFor(() => expect(screen.getByText('elsewhere')).toBeTruthy());
    });

    it('shows an error message when the item cannot be loaded', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 500 }) as Response));
        renderItemDetails();

        await waitFor(() => expect(screen.getByText('Could not load item comments.')).toBeTruthy());
    });
});
