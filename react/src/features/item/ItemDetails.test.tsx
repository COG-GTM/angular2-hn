import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';

import type { Story } from '../../shared/models';
import { hackerNewsApi } from '../../shared/services/hackernews-api';
import { SettingsProvider } from '../../shared/settings/SettingsContext';
import { ItemDetails } from './ItemDetails';

type TestStory = Story & {
    text?: string;
    content?: string;
};

function makeStory(overrides: Partial<TestStory> = {}): TestStory {
    return {
        id: 1,
        title: 'Test story',
        points: 10,
        user: 'alice',
        time: 123,
        time_ago: 10,
        type: 'story',
        url: 'https://example.com/story',
        domain: 'example.com',
        comments: [],
        comments_count: 2,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
        ...overrides,
    };
}

function renderItem(initialEntries = ['/item/1']) {
    return render(
        <SettingsProvider>
            <MemoryRouter initialEntries={initialEntries}>
                <Routes>
                    <Route path="/item/:id" element={<ItemDetails />} />
                    <Route path="/user/:id" element={<div>user page</div>} />
                </Routes>
            </MemoryRouter>
        </SettingsProvider>
    );
}

function NavigationControls() {
    const navigate = useNavigate();

    return <button onClick={() => navigate('/item/2')}>Go second item</button>;
}

function renderItemWithNavigation() {
    return render(
        <SettingsProvider>
            <MemoryRouter initialEntries={['/item/1']}>
                <Routes>
                    <Route
                        path="/item/:id"
                        element={
                            <>
                                <NavigationControls />
                                <ItemDetails />
                            </>
                        }
                    />
                </Routes>
            </MemoryRouter>
        </SettingsProvider>
    );
}

describe('ItemDetails', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
        vi.stubGlobal('scrollTo', vi.fn());
    });

    it('shows the loader while the item is loading', () => {
        vi.spyOn(hackerNewsApi, 'fetchItemContent').mockReturnValue(new Promise(() => undefined));

        renderItem();

        expect(screen.getByText('Loading...')).toHaveClass('loader');
        expect(document.querySelector('.item')).not.toBeInTheDocument();
    });

    it('shows an error when loading the item fails', async () => {
        vi.spyOn(hackerNewsApi, 'fetchItemContent').mockRejectedValue(new Error('network error'));

        renderItem();

        expect(await screen.findByText('Could not load item comments.')).toBeInTheDocument();
        expect(document.querySelector('.error-section')).toBeInTheDocument();
    });

    it('renders an external title and domain without new-tab attributes by default', async () => {
        vi.spyOn(hackerNewsApi, 'fetchItemContent').mockResolvedValue(makeStory());

        renderItem();

        const title = await screen.findAllByRole('link', { name: 'Test story' });
        const externalTitle = title.find((link) => link.classList.contains('title'));

        expect(externalTitle).toHaveAttribute('href', 'https://example.com/story');
        expect(externalTitle).not.toHaveAttribute('target');
        expect(externalTitle).not.toHaveAttribute('rel');
        expect(document.querySelector('.domain')).toHaveTextContent('(example.com)');
    });

    it('opens external titles in a new tab when configured', async () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        vi.spyOn(hackerNewsApi, 'fetchItemContent').mockResolvedValue(makeStory());

        renderItem();

        const titles = await screen.findAllByRole('link', { name: 'Test story' });
        const externalTitle = titles.find((link) => link.classList.contains('title'));

        expect(externalTitle).toHaveAttribute('target', '_blank');
        expect(externalTitle).toHaveAttribute('rel', 'noopener');
    });

    it('renders an internal title link when the story has no URL', async () => {
        vi.spyOn(hackerNewsApi, 'fetchItemContent').mockResolvedValue(
            makeStory({ url: '', domain: '', comments_count: 0 })
        );

        renderItem();

        const titles = await screen.findAllByRole('link', { name: 'Test story' });
        expect(titles.some((title) => title.getAttribute('href') === '/item/1')).toBe(true);
        expect(document.querySelector('.domain')).not.toBeInTheDocument();
    });

    it('renders job metadata without points or comment links', async () => {
        vi.spyOn(hackerNewsApi, 'fetchItemContent').mockResolvedValue(makeStory({ type: 'job' }));

        renderItem();

        await screen.findAllByRole('link', { name: 'Test story' });
        const laptop = document.querySelector('.laptop');
        const subtextSpans = laptop?.querySelectorAll('.subtext > span');

        expect(laptop).toHaveClass('item-header');
        expect(laptop).not.toHaveTextContent('points by');
        expect(laptop?.querySelector('.subtext a')).not.toBeInTheDocument();
        expect(subtextSpans).toHaveLength(1);
        expect(subtextSpans?.[0]).not.toHaveClass('item-details');
    });

    it('adds the laptop header only when comments exist for non-job stories', async () => {
        vi.spyOn(hackerNewsApi, 'fetchItemContent').mockResolvedValue(makeStory({ comments_count: 0 }));

        renderItem();

        await screen.findAllByRole('link', { name: 'Test story' });
        expect(document.querySelector('.laptop')).not.toHaveClass('item-header');
    });

    it('adds head margin only for stories with text', async () => {
        vi.spyOn(hackerNewsApi, 'fetchItemContent').mockResolvedValue(makeStory({ text: 'x' }));

        renderItem();

        await screen.findAllByRole('link', { name: 'Test story' });
        expect(document.querySelector('.laptop')).toHaveClass('head-margin');

        vi.restoreAllMocks();
        vi.spyOn(hackerNewsApi, 'fetchItemContent').mockResolvedValue(makeStory());
        renderItem();

        const laptops = await screen.findAllByRole('link', { name: 'Test story' });
        expect(laptops.length).toBeGreaterThan(0);
        expect(document.querySelectorAll('.laptop')[1]).not.toHaveClass('head-margin');
    });

    it('renders poll results with proportional bars', async () => {
        vi.spyOn(hackerNewsApi, 'fetchItemContent').mockResolvedValue(
            makeStory({
                type: 'poll',
                poll_votes_count: 120,
                poll: [
                    { points: 30, content: 'first option' },
                    { points: 90, content: 'second option' },
                ],
            })
        );

        renderItem();

        await screen.findByText('first option');
        const bars = document.querySelectorAll('.pollBar');
        expect(bars[0]).toHaveStyle({ width: '25%' });
        expect(bars[1]).toHaveStyle({ width: '75%' });
        expect(document.querySelectorAll('.pollContent .subtext')[0]).toHaveTextContent('30 points');
    });

    it('renders item content as HTML', async () => {
        vi.spyOn(hackerNewsApi, 'fetchItemContent').mockResolvedValue(makeStory({ content: '<b>bold</b>' }));

        renderItem();

        await screen.findByText('bold');
        expect(document.querySelector('.subject b')).toHaveTextContent('bold');
    });

    it('navigates back when the back button is clicked', async () => {
        vi.spyOn(hackerNewsApi, 'fetchItemContent').mockResolvedValue(makeStory());
        const user = userEvent.setup();

        render(
            <SettingsProvider>
                <MemoryRouter initialEntries={['/', '/item/1']} initialIndex={1}>
                    <Routes>
                        <Route path="/" element={<div>home</div>} />
                        <Route path="/item/:id" element={<ItemDetails />} />
                    </Routes>
                </MemoryRouter>
            </SettingsProvider>
        );

        await screen.findAllByRole('link', { name: 'Test story' });
        await user.click(document.querySelector('.back-button') as HTMLElement);

        expect(screen.getByText('home')).toBeInTheDocument();
    });

    it('scrolls to the top before the fetch resolves', () => {
        const fetch = vi.spyOn(hackerNewsApi, 'fetchItemContent').mockReturnValue(new Promise(() => undefined));

        renderItem();

        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
        expect(fetch).toHaveBeenCalledWith(1);
    });

    it('renders nested comments at three levels', async () => {
        const third = {
            id: 3,
            level: 2,
            user: 'third',
            time: 3,
            time_ago: '3 hours ago',
            content: 'third comment',
            deleted: false,
            comments: [],
        };
        const second = {
            id: 2,
            level: 1,
            user: 'second',
            time: 2,
            time_ago: '2 hours ago',
            content: 'second comment',
            deleted: false,
            comments: [third],
        };
        const first = {
            id: 1,
            level: 0,
            user: 'first',
            time: 1,
            time_ago: '1 hour ago',
            content: 'first comment',
            deleted: false,
            comments: [second],
        };
        vi.spyOn(hackerNewsApi, 'fetchItemContent').mockResolvedValue(makeStory({ comments: [first] }));

        renderItem();

        expect(await screen.findByText('first comment')).toBeInTheDocument();
        expect(screen.getByText('second comment')).toBeInTheDocument();
        expect(screen.getByText('third comment')).toBeInTheDocument();
    });

    it('refetches on route changes and ignores stale responses', async () => {
        let resolveFirst: (story: TestStory) => void = () => undefined;
        const firstPromise = new Promise<TestStory>((resolve) => {
            resolveFirst = resolve;
        });
        const secondStory = makeStory({ id: 2, title: 'Second story' });
        const firstStory = makeStory({ id: 1, title: 'First story' });
        const fetch = vi
            .spyOn(hackerNewsApi, 'fetchItemContent')
            .mockReturnValueOnce(firstPromise)
            .mockResolvedValueOnce(secondStory);
        const user = userEvent.setup();

        renderItemWithNavigation();

        expect(fetch).toHaveBeenCalledWith(1);
        await user.click(screen.getByRole('button', { name: 'Go second item' }));
        await waitFor(() => expect(fetch).toHaveBeenNthCalledWith(2, 2));
        expect(await screen.findAllByRole('link', { name: 'Second story' })).not.toHaveLength(0);

        await act(async () => {
            resolveFirst(firstStory);
            await firstPromise;
        });

        expect(screen.queryByRole('link', { name: 'First story' })).not.toBeInTheDocument();
        expect(screen.getAllByRole('link', { name: 'Second story' })).not.toHaveLength(0);
    });

    it('supports navigation links to user pages', async () => {
        vi.spyOn(hackerNewsApi, 'fetchItemContent').mockResolvedValue(makeStory());

        render(
            <SettingsProvider>
                <MemoryRouter initialEntries={['/item/1']}>
                    <Routes>
                        <Route path="/item/:id" element={<ItemDetails />} />
                        <Route path="/user/:id" element={<div>user page</div>} />
                    </Routes>
                    <Link to="/user/alice">user shortcut</Link>
                </MemoryRouter>
            </SettingsProvider>
        );

        expect(await screen.findAllByRole('link', { name: 'Test story' })).not.toHaveLength(0);
    });
});
