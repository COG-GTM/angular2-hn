import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchItemContent } from '../../api/hnApi';
import { makeComment, makeStory } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import ItemDetails from './ItemDetails';

vi.mock('../../api/hnApi');

const mockFetchItem = vi.mocked(fetchItemContent);

function renderAt(route: string) {
    return renderWithProviders(
        <Routes>
            <Route path="/item" element={<ItemDetails />} />
            <Route path="/item/:id" element={<ItemDetails />} />
        </Routes>,
        { route }
    );
}

const story = makeStory({
    id: 8863,
    title: 'My YC app: Dropbox',
    url: 'http://www.getdropbox.com/u/2/screencast.html',
    domain: 'getdropbox.com',
    points: 104,
    user: 'dhouston',
    comments_count: 2,
    content: '<p>Story body</p>',
    comments: [
        makeComment({
            id: 1,
            user: 'nickb',
            content: '<p>Top level</p>',
            comments: [makeComment({ id: 2, user: 'reply', content: '<p>Nested reply</p>' })],
        }),
    ],
});

beforeEach(() => {
    localStorage.clear();
    mockFetchItem.mockReset();
    vi.mocked(window.scrollTo).mockClear();
});

describe('ItemDetails', () => {
    it('shows the loader while loading', () => {
        mockFetchItem.mockReturnValue(new Promise(() => {}));
        renderAt('/item/8863');
        expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('renders the story and nested comments from /item/:id', async () => {
        mockFetchItem.mockResolvedValue(story);
        const { container } = renderAt('/item/8863');
        expect(await screen.findByText('Nested reply')).toBeInTheDocument();
        expect(mockFetchItem).toHaveBeenCalledWith(8863, expect.any(AbortSignal));
        const titles = screen.getAllByRole('link', { name: 'My YC app: Dropbox' });
        expect(titles).toHaveLength(2);
        titles.forEach((t) => expect(t).toHaveAttribute('href', 'http://www.getdropbox.com/u/2/screencast.html'));
        expect(screen.getByText('(getdropbox.com)')).toBeInTheDocument();
        expect(container.querySelector('.laptop .subtext')).toHaveTextContent('104 points by dhouston');
        expect(container.querySelector('.laptop')).toHaveClass('item-header');
        expect(screen.getByRole('link', { name: '2 comments' })).toHaveAttribute('href', '/item/8863');
        expect(container.querySelector('.subject')).toHaveTextContent('Story body');
        expect(screen.getByText('Top level')).toBeInTheDocument();
        expect(screen.getByText('Nested reply').closest('.subtree')).not.toBeNull();
    });

    it('reads the id from ?id=', async () => {
        mockFetchItem.mockResolvedValue(story);
        renderAt('/item?id=8863');
        expect(await screen.findByText('Top level')).toBeInTheDocument();
        expect(mockFetchItem).toHaveBeenCalledWith(8863, expect.any(AbortSignal));
    });

    it('opens the title in a new tab when the setting is on', async () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        mockFetchItem.mockResolvedValue(story);
        renderAt('/item/8863');
        await screen.findByText('Top level');
        screen
            .getAllByRole('link', { name: 'My YC app: Dropbox' })
            .forEach((t) => expect(t).toHaveAttribute('target', '_blank'));
    });

    it('renders poll results with proportional bars', async () => {
        mockFetchItem.mockResolvedValue(
            makeStory({
                id: 126809,
                type: 'poll',
                url: 'item?id=126809',
                title: 'Poll: What would happen if News.YC had explicit support for polls?',
                poll: [
                    { points: 30, content: 'Option A' },
                    { points: 10, content: 'Option B' },
                ],
                poll_votes_count: 40,
            })
        );
        const { container } = renderAt('/item/126809');
        expect(await screen.findByText('Option A')).toBeInTheDocument();
        const bars = container.querySelectorAll<HTMLElement>('.pollContent .pollBar');
        expect(bars).toHaveLength(2);
        expect(bars[0].style.width).toBe('75%');
        expect(bars[1].style.width).toBe('25%');
        expect(screen.getByText('30 points')).toBeInTheDocument();
        screen
            .getAllByRole('link', { name: /Poll: What would happen/ })
            .forEach((t) => expect(t).toHaveAttribute('href', '/item/126809'));
    });

    it('goes back when the back button is clicked', async () => {
        const user = userEvent.setup();
        mockFetchItem.mockResolvedValue(story);
        renderWithProviders(
            <Routes>
                <Route path="/news/1" element={<Link to="/item/8863">open item</Link>} />
                <Route path="/item/:id" element={<ItemDetails />} />
            </Routes>,
            { route: '/news/1' }
        );
        await user.click(screen.getByRole('link', { name: 'open item' }));
        await screen.findByText('Top level');
        expect(screen.getByTestId('location')).toHaveTextContent('/item/8863');
        await user.click(screen.getByRole('button', { name: 'Back' }));
        expect(screen.getByTestId('location')).toHaveTextContent('/news/1');
    });

    it('shows an error when the request fails', async () => {
        mockFetchItem.mockRejectedValue(new Error('boom'));
        renderAt('/item/8863');
        expect(await screen.findByRole('alert')).toHaveTextContent('Could not load item comments.');
    });

    it.each(['/item', '/item/abc', '/item?id=-1'])('shows an error for an invalid id (%s)', (route) => {
        renderAt(route);
        expect(screen.getByRole('alert')).toHaveTextContent('Could not load item comments.');
        expect(mockFetchItem).not.toHaveBeenCalled();
    });
});
