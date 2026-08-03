import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';

import { fetchItemContent } from '../../shared/api/hackernews-api';
import { makeStory } from '../../test/fixtures';
import { renderWithProviders } from '../../test/renderWithProviders';
import ItemDetailsPage from './ItemDetailsPage';

vi.mock('../../shared/api/hackernews-api', () => ({
    fetchItemContent: vi.fn(),
}));

const navigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>();
    return { ...actual, useNavigate: () => navigate };
});

const fetchItemContentMock = vi.mocked(fetchItemContent);

function renderItem(route = '/item/8863') {
    return renderWithProviders(
        <Routes>
            <Route path="/item/:id" element={<ItemDetailsPage />} />
        </Routes>,
        { route }
    );
}

describe('ItemDetailsPage', () => {
    beforeEach(() => {
        localStorage.clear();
        navigate.mockReset();
        fetchItemContentMock.mockReset();
        vi.stubGlobal('scrollTo', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('shows the loader, then the item with its metadata', async () => {
        fetchItemContentMock.mockResolvedValue(makeStory({ content: '<p>Story text</p>' }));

        renderItem();
        expect(screen.getByText('Loading...')).toBeInTheDocument();

        expect(await screen.findByText('Story text')).toBeInTheDocument();
        expect(fetchItemContentMock).toHaveBeenCalledWith(8863);
        expect(screen.getAllByRole('link', { name: /My YC app/ })[0]).toHaveAttribute(
            'href',
            'http://www.getdropbox.com/u/2/screencast.html'
        );
        expect(screen.getByText('(getdropbox.com)')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: '71 comments' })).toHaveAttribute('href', '/item/8863');
        expect(screen.getByRole('link', { name: 'dhouston' })).toHaveAttribute('href', '/user/dhouston');
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('links the title internally when the item has no external url', async () => {
        fetchItemContentMock.mockResolvedValue(makeStory({ url: 'item?id=8863', domain: '' }));

        renderItem();

        const titles = await screen.findAllByRole('link', { name: /My YC app/ });
        expect(titles[0]).toHaveAttribute('href', '/item/8863');
        expect(screen.queryByText('(getdropbox.com)')).not.toBeInTheDocument();
    });

    it('opens the external title link in a new tab when the setting is enabled', async () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        fetchItemContentMock.mockResolvedValue(makeStory());

        renderItem();

        const titles = await screen.findAllByRole('link', { name: /My YC app/ });
        expect(titles[0]).toHaveAttribute('target', '_blank');
    });

    it('renders poll options with a bar sized by their share of the votes', async () => {
        fetchItemContentMock.mockResolvedValue(
            makeStory({
                type: 'poll',
                poll: [
                    { points: 30, content: '<p>Option A</p>' },
                    { points: 10, content: '<p>Option B</p>' },
                ],
                poll_votes_count: 40,
            })
        );

        const { container } = renderItem();

        expect(await screen.findByText('Option A')).toBeInTheDocument();
        expect(screen.getByText('30 points')).toBeInTheDocument();
        const bars = container.querySelectorAll('.pollBar');
        expect(bars[0]).toHaveStyle({ width: '75%' });
        expect(bars[1]).toHaveStyle({ width: '25%' });
    });

    it('renders the comment threads of the item', async () => {
        fetchItemContentMock.mockResolvedValue(
            makeStory({
                comments: [
                    {
                        id: 1,
                        level: 0,
                        user: 'pg',
                        time: 1,
                        time_ago: '1 hour ago',
                        content: '<p>First</p>',
                        deleted: false,
                        comments: [
                            {
                                id: 2,
                                level: 1,
                                user: 'jl',
                                time: 2,
                                time_ago: '30 minutes ago',
                                content: '<p>Second</p>',
                                deleted: false,
                                comments: [],
                            },
                        ],
                    },
                ],
            })
        );

        renderItem();

        expect(await screen.findByText('First')).toBeInTheDocument();
        expect(screen.getByText('Second')).toBeInTheDocument();
    });

    it('hides points, author and comments for jobs', async () => {
        fetchItemContentMock.mockResolvedValue(makeStory({ type: 'job', comments_count: 0, user: '' }));

        renderItem();

        await screen.findAllByRole('link', { name: /My YC app/ });
        expect(screen.queryByText(/points by/)).not.toBeInTheDocument();
    });

    it('navigates back in history from the mobile header', async () => {
        fetchItemContentMock.mockResolvedValue(makeStory());

        renderItem();
        await screen.findAllByRole('link', { name: /My YC app/ });

        await userEvent.click(screen.getByRole('button', { name: 'Go back' }));

        expect(navigate).toHaveBeenCalledWith(-1);
    });

    it('shows an error message when the item cannot be loaded', async () => {
        fetchItemContentMock.mockRejectedValue(new Error('offline'));

        renderItem();

        expect(await screen.findByText('Could not load item comments.')).toBeInTheDocument();
        await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
    });
});
