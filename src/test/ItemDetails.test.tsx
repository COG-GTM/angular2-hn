import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ItemDetails from '../pages/ItemDetails';
import { SettingsProvider } from '../context/SettingsContext';

const mockItem = {
    id: 42,
    title: 'Test Item Title',
    points: 200,
    user: 'itemuser',
    time: 1234567890,
    time_ago: '2 hours ago',
    type: 'story' as const,
    url: 'https://example.com/article',
    domain: 'example.com',
    comments: [
        {
            id: 100,
            level: 0,
            user: 'commenter',
            time: 1234567890,
            time_ago: '1 hour ago',
            content: '<p>Great article!</p>',
            deleted: false,
            comments: [],
        },
    ],
    comments_count: 1,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
    content: '',
    text: '',
};

beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        json: () => Promise.resolve(mockItem),
    } as Response);
});

describe('ItemDetails', () => {
    it('renders loading state initially', () => {
        render(
            <SettingsProvider>
                <MemoryRouter initialEntries={['/item/42']}>
                    <Routes>
                        <Route path="/item/:id" element={<ItemDetails />} />
                    </Routes>
                </MemoryRouter>
            </SettingsProvider>
        );
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders item details after loading', async () => {
        render(
            <SettingsProvider>
                <MemoryRouter initialEntries={['/item/42']}>
                    <Routes>
                        <Route path="/item/:id" element={<ItemDetails />} />
                    </Routes>
                </MemoryRouter>
            </SettingsProvider>
        );
        await waitFor(() => {
            expect(screen.getAllByText('Test Item Title').length).toBeGreaterThan(0);
        });
    });

    it('renders comments', async () => {
        render(
            <SettingsProvider>
                <MemoryRouter initialEntries={['/item/42']}>
                    <Routes>
                        <Route path="/item/:id" element={<ItemDetails />} />
                    </Routes>
                </MemoryRouter>
            </SettingsProvider>
        );
        await waitFor(() => {
            expect(screen.getByText('commenter')).toBeInTheDocument();
        });
    });
});
