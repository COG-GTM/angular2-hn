import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchItemContent } from '../api/hackerNews';
import { SettingsProvider } from '../context/SettingsContext';
import { Comment } from '../models/comment';
import { Story } from '../models/story';
import { stubMatchMedia } from '../testUtils/matchMedia';
import { ItemDetailsPage } from './ItemDetailsPage';

vi.mock('../api/hackerNews', () => ({
    fetchItemContent: vi.fn(),
}));

const fetchItemContentMock = vi.mocked(fetchItemContent);

function buildComment(overrides: Partial<Comment> = {}): Comment {
    return {
        id: 100,
        level: 0,
        user: 'kate',
        time: 1500000000,
        time_ago: '1 hour ago',
        content: 'a comment',
        comments: [],
        ...overrides,
    };
}

function buildStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 42,
        title: 'A React story',
        points: 120,
        user: 'alice',
        time: 1500000000,
        time_ago: '3 hours ago',
        type: 'story',
        url: 'https://example.com/story',
        domain: 'example.com',
        comments: [],
        comments_count: 2,
        ...overrides,
    };
}

function GoToItem({ id }: { id: number }) {
    const navigate = useNavigate();
    return <button onClick={() => navigate(`/item/${id}`)}>go</button>;
}

function renderPage(initialEntries: string[] = ['/item/42'], initialIndex?: number) {
    return render(
        <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
            <SettingsProvider>
                <Routes>
                    <Route path="/" element={<p>news feed</p>} />
                    <Route path="/item/:id" element={<ItemDetailsPage />} />
                </Routes>
            </SettingsProvider>
        </MemoryRouter>
    );
}

describe('ItemDetailsPage', () => {
    beforeEach(() => {
        stubMatchMedia(false);
        vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
        fetchItemContentMock.mockReset();
    });

    it('shows the loader while the item is being fetched', () => {
        fetchItemContentMock.mockReturnValue(new Promise<Story>(() => undefined));

        const { container } = renderPage();

        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(container.querySelector('.main-content .loading-section')).not.toBeNull();
        expect(container.querySelector('.item')).toBeNull();
    });

    it('fetches the item id taken from the route and scrolls to the top', async () => {
        fetchItemContentMock.mockResolvedValue(buildStory());

        renderPage(['/item/42']);

        await screen.findAllByText('A React story');
        expect(fetchItemContentMock).toHaveBeenCalledWith(42);
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('shows the error message when the item cannot be loaded', async () => {
        fetchItemContentMock.mockRejectedValue(new Error('offline'));

        const { container } = renderPage();

        expect(await screen.findByText('Could not load item comments.')).toBeInTheDocument();
        expect(container.querySelector('.loading-section')).toBeNull();
        expect(container.querySelector('.item')).toBeNull();
    });

    it('renders the mobile and laptop headers for a story with an external url', async () => {
        fetchItemContentMock.mockResolvedValue(buildStory({ content: '<p>story body</p>' }));

        const { container } = renderPage();
        await screen.findAllByText('A React story');

        const mobileHeader = container.querySelector('.mobile.item-header') as HTMLElement;

        const mobileTitle = mobileHeader.querySelector('a.title');
        expect(mobileTitle).toHaveAttribute('href', 'https://example.com/story');
        expect(mobileTitle).not.toHaveAttribute('target');
        expect(mobileTitle).not.toHaveAttribute('rel');
        expect(mobileHeader.querySelector('.title-block .back-button')).not.toBeNull();

        const laptopHeader = container.querySelector('.laptop') as HTMLElement;
        expect(laptopHeader).toHaveClass('item-header');
        expect(laptopHeader).toHaveClass('head-margin');
        expect(laptopHeader.querySelector('a.title')).toHaveAttribute('href', 'https://example.com/story');
        expect(laptopHeader.querySelector('.domain')?.textContent).toBe('(example.com)');

        const subtext = laptopHeader.querySelector('.subtext') as HTMLElement;
        expect(subtext.textContent).toContain('120 points by');
        expect(subtext.querySelector('a[href="/user/alice"]')).not.toBeNull();
        expect(subtext.querySelector('.item-details')?.textContent).toContain('3 hours ago');
        expect(subtext.querySelector('a[href="/item/42"]')?.textContent).toBe('2 comments');

        expect(container.querySelector('.subject')?.innerHTML).toBe('<p>story body</p>');
    });

    it('opens the story link in a new tab when the setting is enabled', async () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        fetchItemContentMock.mockResolvedValue(buildStory());

        const { container } = renderPage();
        await screen.findAllByText('A React story');

        container.querySelectorAll('a.title').forEach((title) => {
            expect(title).toHaveAttribute('target', '_blank');
            expect(title).toHaveAttribute('rel', 'noopener');
        });
    });

    it('links the title to the item itself when the story has no external url', async () => {
        fetchItemContentMock.mockResolvedValue(
            buildStory({ url: 'item?id=42', domain: undefined, comments_count: 0, content: undefined })
        );

        const { container } = renderPage();
        await screen.findAllByText('A React story');

        container.querySelectorAll('a.title').forEach((title) => {
            expect(title).toHaveAttribute('href', '/item/42');
        });
        expect(container.querySelector('.domain')).toBeNull();
        expect(container.querySelector('.laptop')).not.toHaveClass('item-header');
        expect(container.querySelector('.laptop')).not.toHaveClass('head-margin');
        expect(container.querySelector('.subtext a[href="/item/42"]')?.textContent).toBe('discuss');
        expect(container.querySelector('.subject')?.innerHTML).toBe('');
    });

    it('hides the points and comment count for job postings', async () => {
        fetchItemContentMock.mockResolvedValue(buildStory({ type: 'job', comments_count: 0 }));

        const { container } = renderPage();
        await screen.findAllByText('A React story');

        const subtext = container.querySelector('.laptop .subtext') as HTMLElement;
        expect(subtext.textContent?.trim()).toBe('3 hours ago');
        expect(subtext.querySelector('.item-details')).toBeNull();
        expect(subtext.querySelector('a')).toBeNull();
        expect(container.querySelector('.laptop')).toHaveClass('item-header');
    });

    it('renders poll results with bars sized from the vote share', async () => {
        fetchItemContentMock.mockResolvedValue(
            buildStory({
                type: 'poll',
                poll: [
                    { points: 30, content: '<p>Option A</p>' },
                    { points: 10, content: '<p>Option B</p>' },
                ],
                poll_votes_count: 40,
            })
        );

        const { container } = renderPage();
        await screen.findAllByText('A React story');

        const pollContents = container.querySelectorAll('.pollResults .pollContent');
        expect(pollContents).toHaveLength(2);
        expect(pollContents[0].textContent).toContain('Option A');
        expect(pollContents[0].querySelector('.subtext')?.textContent).toBe('30 points');
        expect(pollContents[0].querySelector<HTMLElement>('.pollBar')?.style.width).toBe('75%');
        expect(pollContents[1].querySelector('.subtext')?.textContent).toBe('10 points');
        expect(pollContents[1].querySelector<HTMLElement>('.pollBar')?.style.width).toBe('25%');
    });

    it('does not render poll results for a regular story', async () => {
        fetchItemContentMock.mockResolvedValue(buildStory());

        const { container } = renderPage();
        await screen.findAllByText('A React story');

        expect(container.querySelector('.pollResults')).toBeNull();
    });

    it('renders the comment list, including nested comments', async () => {
        fetchItemContentMock.mockResolvedValue(
            buildStory({
                comments: [
                    buildComment({
                        id: 100,
                        content: 'first comment',
                        comments: [buildComment({ id: 101, user: 'bob', content: 'nested reply' })],
                    }),
                    buildComment({ id: 102, user: 'carol', content: 'second comment' }),
                ],
            })
        );

        const { container } = renderPage();
        await screen.findAllByText('A React story');

        expect(container.querySelectorAll('.comment-list > li')).toHaveLength(2);
        expect(screen.getByText('first comment')).toBeInTheDocument();
        expect(screen.getByText('nested reply')).toBeInTheDocument();
        expect(screen.getByText('second comment')).toBeInTheDocument();
    });

    it('goes back in history when the back button is clicked', async () => {
        const user = userEvent.setup();
        fetchItemContentMock.mockResolvedValue(buildStory());

        const { container } = renderPage(['/', '/item/42'], 1);
        await screen.findAllByText('A React story');

        await user.click(container.querySelector('.back-button') as HTMLElement);

        expect(await screen.findByText('news feed')).toBeInTheDocument();
    });

    it('refetches when the route id changes', async () => {
        const user = userEvent.setup();
        fetchItemContentMock.mockResolvedValue(buildStory());

        render(
            <MemoryRouter initialEntries={['/item/42']}>
                <SettingsProvider>
                    <GoToItem id={7} />
                    <Routes>
                        <Route path="/item/:id" element={<ItemDetailsPage />} />
                    </Routes>
                </SettingsProvider>
            </MemoryRouter>
        );
        await screen.findAllByText('A React story');

        fetchItemContentMock.mockResolvedValue(buildStory({ id: 7, title: 'Another story' }));
        await user.click(screen.getByRole('button', { name: 'go' }));

        await screen.findAllByText('Another story');
        expect(fetchItemContentMock).toHaveBeenLastCalledWith(7);
    });
});
