import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as api from '../api/hackernews';
import { ItemDetailsPage } from './ItemDetailsPage';
import { SettingsProvider } from '../context';
import type { Story } from '../models';

function makeItem(overrides: Partial<Story> = {}): Story {
    return {
        id: 100,
        title: 'A story',
        points: 42,
        user: 'pg',
        time: 0,
        time_ago: '2 hours ago',
        type: 'story',
        url: 'https://example.com/a',
        domain: 'example.com',
        comments: [],
        comments_count: 1,
        poll: [],
        poll_votes_count: 0,
        content: '<p>the body</p>',
        deleted: false,
        dead: false,
        ...overrides,
    };
}

function renderPage(path = '/item/100') {
    return render(
        <MemoryRouter initialEntries={['/news/1', path]} initialIndex={1}>
            <SettingsProvider>
                <Routes>
                    <Route path="/news/:page" element={<div>feed page</div>} />
                    <Route path="/item/:id" element={<ItemDetailsPage />} />
                </Routes>
            </SettingsProvider>
        </MemoryRouter>
    );
}

beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('scrollTo', vi.fn());
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

describe('ItemDetailsPage', () => {
    it('shows the loader until the item resolves', () => {
        vi.spyOn(api, 'fetchItemContent').mockReturnValue(new Promise(() => {}));

        const { container } = renderPage();

        expect(container.querySelector('.loading-section')).toBeInTheDocument();
    });

    it('fetches the routed item and scrolls to the top', async () => {
        vi.spyOn(api, 'fetchItemContent').mockResolvedValue(makeItem());

        renderPage('/item/100');

        await screen.findAllByText('A story');
        expect(api.fetchItemContent).toHaveBeenCalledWith(100, expect.any(AbortSignal));
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('renders the story header, body and comments', async () => {
        vi.spyOn(api, 'fetchItemContent').mockResolvedValue(
            makeItem({
                comments: [
                    {
                        id: 1,
                        level: 0,
                        user: 'dang',
                        time: 0,
                        time_ago: '1 hour ago',
                        content: '<p>nice</p>',
                        deleted: false,
                        comments: [],
                    },
                ],
            })
        );

        const { container } = renderPage();

        await screen.findByText('the body');
        expect(container.querySelectorAll('.title')[0]).toHaveAttribute('href', 'https://example.com/a');
        expect(screen.getByText('(example.com)')).toBeInTheDocument();
        expect(screen.getByText('42 points by')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: '1 comment' })).toHaveAttribute('href', '/item/100');
        expect(screen.getByText('nice')).toBeInTheDocument();
    });

    it('links the title internally when the item has no external url', async () => {
        vi.spyOn(api, 'fetchItemContent').mockResolvedValue(makeItem({ url: 'item?id=100', domain: '' }));

        const { container } = renderPage();

        await screen.findByText('the body');
        expect(container.querySelectorAll('.title')[0]).toHaveAttribute('href', '/item/100');
    });

    it('opens external titles in a new tab when the setting is on', async () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        vi.spyOn(api, 'fetchItemContent').mockResolvedValue(makeItem());

        const { container } = renderPage();

        await screen.findByText('the body');
        const title = container.querySelectorAll('.title')[0];
        expect(title).toHaveAttribute('target', '_blank');
        expect(title).toHaveAttribute('rel', 'noopener');
    });

    it('renders poll results sized by their share of the votes', async () => {
        vi.spyOn(api, 'fetchItemContent').mockResolvedValue(
            makeItem({
                type: 'poll',
                poll: [
                    { points: 75, content: 'yes' },
                    { points: 25, content: 'no' },
                ],
                poll_votes_count: 100,
            })
        );

        const { container } = renderPage();

        await screen.findByText('yes');
        const bars = container.querySelectorAll('.pollBar');
        expect(bars[0]).toHaveStyle({ width: '75%' });
        expect(bars[1]).toHaveStyle({ width: '25%' });
    });

    it('hides points, author and comments for jobs', async () => {
        vi.spyOn(api, 'fetchItemContent').mockResolvedValue(makeItem({ type: 'job', comments_count: 0 }));

        renderPage();

        await screen.findByText('the body');
        expect(screen.queryByText(/points by/)).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'pg' })).not.toBeInTheDocument();
    });

    it('shows the comments error message when the request fails', async () => {
        vi.spyOn(api, 'fetchItemContent').mockRejectedValue(new Error('nope'));

        renderPage();

        expect(await screen.findByText('Could not load item comments.')).toBeInTheDocument();
    });

    it('navigates back when the back button is clicked', async () => {
        vi.spyOn(api, 'fetchItemContent').mockResolvedValue(makeItem());

        const { container } = renderPage();

        await screen.findByText('the body');
        fireEvent.click(container.querySelector('.back-button') as HTMLElement);

        await waitFor(() => expect(screen.getByText('feed page')).toBeInTheDocument());
    });
});
