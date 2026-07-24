// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type { Story } from '../models';
import { fetchItemContent } from '../api/hackernews';
import { SettingsProvider } from '../context/SettingsContext';
import ItemDetails from './ItemDetails';

vi.mock('../api/hackernews', () => ({
    fetchItemContent: vi.fn(),
}));

const mockedFetchItemContent = vi.mocked(fetchItemContent);

function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 42,
        title: 'A story',
        points: 100,
        user: 'pg',
        time: 0,
        time_ago: '3 hours ago',
        type: 'story',
        url: 'https://example.com/article',
        domain: 'example.com',
        comments: [],
        comments_count: 3,
        poll: [],
        poll_votes_count: 0,
        content: '',
        deleted: false,
        dead: false,
        ...overrides,
    };
}

function renderItemDetails() {
    return render(
        <SettingsProvider>
            <MemoryRouter initialEntries={['/item/42']}>
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
        window.matchMedia = vi.fn().mockImplementation((query: string) => ({
            matches: false,
            media: query,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        }));
        window.scrollTo = vi.fn();
        mockedFetchItemContent.mockReset();
    });

    it('shows a loader while fetching', () => {
        mockedFetchItemContent.mockReturnValue(new Promise(() => {}));
        renderItemDetails();
        expect(screen.getByText('Loading...')).toBeTruthy();
    });

    it('renders the item title, subtext and comments after loading', async () => {
        mockedFetchItemContent.mockResolvedValue(
            makeStory({
                comments: [
                    {
                        id: 7,
                        level: 0,
                        user: 'commenter',
                        time: 0,
                        time_ago: '1 hour ago',
                        content: '<p>nice article</p>',
                        deleted: false,
                        comments: [],
                    },
                ],
            })
        );
        renderItemDetails();
        await waitFor(() => {
            expect(screen.getAllByText('A story').length).toBeGreaterThan(0);
        });
        expect(mockedFetchItemContent).toHaveBeenCalledWith(42);
        expect(screen.getByRole('link', { name: 'pg' })).toBeTruthy();
        expect(screen.getByRole('link', { name: '3 comments' })).toBeTruthy();
        expect(screen.getByText('nice article')).toBeTruthy();
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('renders poll results with proportional bars', async () => {
        mockedFetchItemContent.mockResolvedValue(
            makeStory({
                type: 'poll',
                url: 'item?id=42',
                poll: [
                    { content: 'Option A', points: 30 },
                    { content: 'Option B', points: 10 },
                ],
                poll_votes_count: 40,
            })
        );
        const { container } = renderItemDetails();
        await waitFor(() => {
            expect(screen.getByText('Option A')).toBeTruthy();
        });
        const bars = container.querySelectorAll('.pollBar');
        expect(bars.length).toBe(2);
        expect((bars[0] as HTMLElement).style.width).toBe('75%');
        expect((bars[1] as HTMLElement).style.width).toBe('25%');
    });

    it('shows an error message when the fetch fails', async () => {
        mockedFetchItemContent.mockRejectedValue(new Error('boom'));
        renderItemDetails();
        await waitFor(() => {
            expect(screen.getByText('Could not load item comments.')).toBeTruthy();
        });
    });
});
