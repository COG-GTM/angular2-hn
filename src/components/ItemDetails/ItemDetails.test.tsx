import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ItemDetails } from './ItemDetails';
import { SettingsProvider } from '../../context/SettingsContext';
import { fetchItemContent } from '../../api/hackernews';
import { makeStory, makeComment } from '../../test/fixtures';

vi.mock('../../api/hackernews', () => ({
    fetchItemContent: vi.fn(),
}));

const mockedFetch = vi.mocked(fetchItemContent);

function renderItem(id = '1') {
    return render(
        <SettingsProvider>
            <MemoryRouter initialEntries={['/news/1', `/item/${id}`]} initialIndex={1}>
                <Routes>
                    <Route path="/news/1" element={<div>News feed</div>} />
                    <Route path="/item/:id" element={<ItemDetails />} />
                </Routes>
            </MemoryRouter>
        </SettingsProvider>
    );
}

describe('ItemDetails', () => {
    beforeEach(() => {
        mockedFetch.mockReset();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('shows the loader while loading', () => {
        mockedFetch.mockReturnValue(new Promise(() => {}));
        renderItem();
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('shows the error message when the request fails', async () => {
        mockedFetch.mockRejectedValue(new Error('boom'));
        renderItem();
        await waitFor(() => expect(screen.getByText('Could not load item comments.')).toBeInTheDocument());
    });

    it('renders the story content HTML and comment tree', async () => {
        mockedFetch.mockResolvedValue(
            makeStory({
                id: 7,
                title: 'Ask HN',
                url: 'item?id=7',
                content: '<p>Body text</p>',
                comments: [makeComment({ id: 11, user: 'commenter' })],
            })
        );
        renderItem('7');
        expect(await screen.findByText('Body text')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'commenter' })).toBeInTheDocument();
    });

    it('computes poll bar widths from points / poll_votes_count', async () => {
        mockedFetch.mockResolvedValue(
            makeStory({
                type: 'poll',
                poll: [
                    { points: 30, content: 'Option A' },
                    { points: 10, content: 'Option B' },
                ],
                poll_votes_count: 40,
            })
        );
        const { container } = renderItem();
        await screen.findByText('Option A');
        const bars = container.querySelectorAll('.pollBar');
        expect(bars[0]).toHaveStyle({ width: '75%' });
        expect(bars[1]).toHaveStyle({ width: '25%' });
        expect(screen.getByText('30 points')).toBeInTheDocument();
    });

    it('navigates back when the back button is clicked', async () => {
        mockedFetch.mockResolvedValue(makeStory({ id: 7, title: 'Story title', url: 'item?id=7' }));
        const { container } = renderItem('7');
        await screen.findAllByText('Story title');
        const backButton = container.querySelector('.back-button') as HTMLElement;
        fireEvent.click(backButton);
        expect(await screen.findByText('News feed')).toBeInTheDocument();
    });
});
