import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SettingsProvider } from '../context/SettingsContext';
import ItemDetails from '../components/ItemDetails';
import * as api from '../api/hackerNews';

vi.mock('../api/hackerNews');

const mockItem = {
    id: 42,
    title: 'Test Item',
    points: 100,
    user: 'author',
    time: 123,
    time_ago: '5h',
    type: 'story' as const,
    url: 'https://example.com',
    domain: 'example.com',
    content: '',
    comments: [
        {
            id: 1,
            level: 0,
            user: 'commenter',
            time: 456,
            time_ago: '3h',
            content: '<p>Great post</p>',
            deleted: false,
            comments: [],
        },
    ],
    comments_count: 1,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
};

beforeEach(() => {
    vi.mocked(api.fetchItemContent).mockResolvedValue(mockItem);
});

function renderItemDetails(path = '/item/42') {
    return render(
        <SettingsProvider>
            <MemoryRouter initialEntries={[path]}>
                <Routes>
                    <Route path="/item/:id" element={<ItemDetails />} />
                </Routes>
            </MemoryRouter>
        </SettingsProvider>
    );
}

describe('ItemDetails', () => {
    it('shows loader then renders item', async () => {
        renderItemDetails();
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getAllByText('Test Item').length).toBeGreaterThan(0);
        });
    });

    it('renders comments', async () => {
        renderItemDetails();
        await waitFor(() => {
            expect(screen.getByText('Great post')).toBeInTheDocument();
        });
    });

    it('renders external link for http URLs', async () => {
        renderItemDetails();
        await waitFor(() => {
            const links = screen.getAllByText('Test Item');
            const externalLink = links.find((el) => el.tagName === 'A' && el.getAttribute('href') === 'https://example.com');
            expect(externalLink).toBeTruthy();
        });
    });

    it('renders domain', async () => {
        renderItemDetails();
        await waitFor(() => {
            expect(screen.getAllByText('(example.com)').length).toBeGreaterThan(0);
        });
    });

    it('shows error on fetch failure', async () => {
        vi.mocked(api.fetchItemContent).mockRejectedValueOnce(new Error('fail'));
        renderItemDetails();
        await waitFor(() => {
            expect(screen.getByText(/Could not load item/)).toBeInTheDocument();
        });
    });

    it('renders poll bars for poll type', async () => {
        const pollItem = {
            ...mockItem,
            type: 'poll' as const,
            poll: [
                { points: 30, content: 'Option A' },
                { points: 70, content: 'Option B' },
            ],
            poll_votes_count: 100,
        };
        vi.mocked(api.fetchItemContent).mockResolvedValueOnce(pollItem);
        renderItemDetails();
        await waitFor(() => {
            expect(screen.getByText(/Option A/)).toBeInTheDocument();
            expect(screen.getByText(/Option B/)).toBeInTheDocument();
        });
    });
});
