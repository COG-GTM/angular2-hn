import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Story } from '../models';
import { SettingsProvider } from '../context/SettingsProvider';
import { ItemDetails } from './ItemDetails';
import * as api from '../services/hackernewsApi';

const story: Story = {
    id: 1,
    title: 'A React story',
    points: 42,
    user: 'devin',
    time: 1,
    time_ago: '2 hours ago',
    type: 'story',
    url: 'https://example.com/story',
    domain: 'example.com',
    content: '<p>Story body</p>',
    comments_count: 2,
    comments: [
        {
            id: 10,
            level: 0,
            user: 'alice',
            time: 1,
            time_ago: '1 hour ago',
            content: '<p>Top level comment</p>',
            comments: [
                {
                    id: 11,
                    level: 1,
                    user: 'bob',
                    time: 1,
                    time_ago: '30 minutes ago',
                    content: '<p>Nested reply</p>',
                    comments: [],
                },
            ],
        },
        {
            id: 12,
            level: 0,
            user: 'carol',
            time: 1,
            time_ago: '10 minutes ago',
            content: '',
            deleted: true,
            comments: [],
        },
    ],
};

function renderItem() {
    return render(
        <SettingsProvider>
            <MemoryRouter initialEntries={['/item/1']}>
                <Routes>
                    <Route path="/item/:id" element={<ItemDetails />} />
                </Routes>
            </MemoryRouter>
        </SettingsProvider>,
    );
}

describe('ItemDetails', () => {
    beforeEach(() => {
        window.scrollTo = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders the story header, body and comment tree', async () => {
        vi.spyOn(api, 'fetchItemContent').mockResolvedValue(story);
        const { container } = renderItem();

        expect(container.querySelector('.loader')).toBeInTheDocument();

        expect(await screen.findAllByText('A React story')).toHaveLength(2);
        expect(screen.getByText('(example.com)')).toBeInTheDocument();
        expect(screen.getByText('2 comments')).toBeInTheDocument();
        expect(container.querySelector('.subject')?.innerHTML).toBe('<p>Story body</p>');
        expect(container.querySelectorAll('.comment-list > li')).toHaveLength(2);
        expect(screen.getByText('Nested reply')).toBeInTheDocument();
        expect(container.querySelector('.deleted-meta')?.textContent).toContain('[deleted] | Comment Deleted');
        expect(container.querySelector('.laptop')).toHaveClass('item-header', 'head-margin');
    });

    it('collapses and expands a comment without unmounting its subtree', async () => {
        vi.spyOn(api, 'fetchItemContent').mockResolvedValue(story);
        const { container } = renderItem();
        await screen.findByText('Top level comment');

        const toggle = screen.getAllByText('[-]')[0];
        await userEvent.click(toggle);

        const meta = container.querySelector('.meta');
        expect(meta).toHaveClass('meta-collapse');
        expect(container.querySelector('.comment-tree > div')).toHaveAttribute('hidden');
        expect(screen.getByText('Nested reply')).toBeInTheDocument();

        await userEvent.click(screen.getAllByText('[+]')[0]);
        expect(container.querySelector('.comment-tree > div')).not.toHaveAttribute('hidden');
    });

    it('renders poll results with proportional bars', async () => {
        vi.spyOn(api, 'fetchItemContent').mockResolvedValue({
            ...story,
            type: 'poll',
            url: '',
            poll: [
                { points: 30, content: 'Option A' },
                { points: 10, content: 'Option B' },
            ],
            poll_votes_count: 40,
        });
        const { container } = renderItem();
        await screen.findByText('Option A');

        const bars = container.querySelectorAll('.pollContent .pollBar');
        expect(bars).toHaveLength(2);
        expect((bars[0] as HTMLElement).style.width).toBe('75%');
        expect((bars[1] as HTMLElement).style.width).toBe('25%');
        expect(screen.getByText('30 points')).toBeInTheDocument();
    });

    it('shows an error message when the request fails', async () => {
        vi.spyOn(api, 'fetchItemContent').mockRejectedValue(new Error('boom'));
        renderItem();

        await waitFor(() => {
            expect(screen.getByText('Could not load item comments.')).toBeInTheDocument();
        });
    });
});
