import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';

import * as api from '../shared/api/hackernews-api';
import { createQueryClient } from '../shared/api/query-client';
import type { Comment, PollResult, Story } from '../shared/models';
import { loadInitialSettings, useSettingsStore } from '../shared/store/settings';
import ItemDetails from './ItemDetails';

vi.mock('../shared/api/hackernews-api', async (importOriginal) => {
    const actual = await importOriginal<typeof api>();
    return { ...actual, fetchItemContent: vi.fn() };
});

const fetchItemContent = vi.mocked(api.fetchItemContent);

function makeComment(overrides: Partial<Comment> = {}): Comment {
    return {
        id: 100,
        level: 0,
        user: 'alice',
        time: 1700000000,
        time_ago: '1 hour ago',
        content: '<p>first comment</p>',
        comments: [],
        ...overrides,
    };
}

function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 42,
        title: 'A great story',
        points: 123,
        user: 'pg',
        time: 1700000000,
        time_ago: '3 hours ago',
        type: 'link',
        url: 'https://example.com/post',
        domain: 'example.com',
        comments: [],
        comments_count: 0,
        ...overrides,
    };
}

function renderItem(path = '/item/42') {
    const client = createQueryClient();
    client.setDefaultOptions({ queries: { retry: false } });
    return render(
        <QueryClientProvider client={client}>
            <MemoryRouter initialEntries={['/news/1', path]} initialIndex={1}>
                <Routes>
                    <Route path="/news/:page" element={<div>feed page</div>} />
                    <Route path="/item/:id" element={<ItemDetails />} />
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>
    );
}

describe('ItemDetails', () => {
    beforeEach(() => {
        localStorage.clear();
        useSettingsStore.setState(loadInitialSettings());
        fetchItemContent.mockReset();
        vi.stubGlobal('scrollTo', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('shows the loader while fetching, then the story header with external link, domain, user and comments', async () => {
        fetchItemContent.mockResolvedValue(
            makeStory({ comments_count: 2, comments: [makeComment(), makeComment({ id: 101, user: 'bob' })] })
        );
        const { container } = renderItem();

        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(await screen.findByText('123 points by', { exact: false })).toBeInTheDocument();

        expect(fetchItemContent).toHaveBeenCalledWith(42, expect.anything());
        const titles = screen.getAllByRole('link', { name: 'A great story' });
        expect(titles).toHaveLength(2); // mobile + laptop header
        titles.forEach((title) => {
            expect(title).toHaveAttribute('href', 'https://example.com/post');
            expect(title).not.toHaveAttribute('target');
            expect(title).not.toHaveAttribute('rel');
        });
        expect(screen.getByText('(example.com)')).toHaveClass('domain');
        expect(screen.getByRole('link', { name: 'pg' })).toHaveAttribute('href', '/user/pg');
        expect(screen.getByText('3 hours ago', { exact: false })).toHaveClass('item-details');
        expect(screen.getByRole('link', { name: '2 comments' })).toHaveAttribute('href', '/item/42');
        expect(container.querySelector('.laptop')).toHaveClass('item-header');
        expect(container.querySelectorAll('ul.comment-list > li')).toHaveLength(2);
        expect(container.querySelector('.pollResults')).toBeNull();
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('opens external links in a new tab when the setting is on', async () => {
        useSettingsStore.setState({ openLinkInNewTab: true });
        fetchItemContent.mockResolvedValue(makeStory());
        renderItem();

        const titles = await screen.findAllByRole('link', { name: 'A great story' });
        titles.forEach((title) => {
            expect(title).toHaveAttribute('target', '_blank');
            expect(title).toHaveAttribute('rel', 'noopener');
        });
    });

    it('renders an Ask HN post with an internal title link and injected text content', async () => {
        fetchItemContent.mockResolvedValue(
            makeStory({
                title: 'Ask HN: Anyone?',
                url: 'item?id=42',
                domain: undefined,
                content: '<p>Some <i>question</i> text</p>',
                comments_count: 1,
                comments: [makeComment()],
            })
        );
        const { container } = renderItem();

        const titles = await screen.findAllByRole('link', { name: 'Ask HN: Anyone?' });
        titles.forEach((title) => expect(title).toHaveAttribute('href', '/item/42'));
        expect(container.querySelector('.domain')).toBeNull();
        expect(container.querySelector('p.subject')?.innerHTML).toBe('<p>Some <i>question</i> text</p>');
        expect(screen.getByRole('link', { name: '1 comment' })).toBeInTheDocument();
    });

    it('renders a job item without points, user or comment count', async () => {
        fetchItemContent.mockResolvedValue(
            makeStory({ type: 'job', title: 'Hiring', user: null, points: null, comments_count: 0 })
        );
        const { container } = renderItem();

        await screen.findAllByRole('link', { name: 'Hiring' });
        expect(screen.queryByText(/points by/)).toBeNull();
        expect(screen.queryByRole('link', { name: 'discuss' })).toBeNull();
        expect(screen.getByText('3 hours ago').className).toBe('');
        expect(container.querySelector('.laptop')).toHaveClass('item-header');
    });

    it('does not add item-header to the laptop block for a story without comments', async () => {
        fetchItemContent.mockResolvedValue(makeStory({ comments_count: 0 }));
        const { container } = renderItem();

        await screen.findAllByRole('link', { name: 'A great story' });
        expect(container.querySelector('.laptop')).not.toHaveClass('item-header');
        expect(screen.getByRole('link', { name: 'discuss' })).toHaveAttribute('href', '/item/42');
    });

    it('renders poll options with bars proportional to the vote share', async () => {
        fetchItemContent.mockResolvedValue(
            makeStory({
                type: 'poll',
                url: 'item?id=42',
                poll: [
                    { points: 75, content: 'Option <b>A</b>' },
                    { points: 25, content: 'Option B' },
                ],
                poll_votes_count: 100,
            })
        );
        const { container } = renderItem();

        await screen.findAllByRole('link', { name: 'A great story' });
        const options = container.querySelectorAll('.pollResults .pollContent');
        expect(options).toHaveLength(2);
        expect(screen.queryByText('Some poll options could not be loaded.')).toBeNull();
        expect(options[0].querySelector('div')?.innerHTML).toBe('Option <b>A</b>');
        expect(screen.getByText('75 points')).toHaveClass('subtext');
        expect(screen.getByText('25 points')).toHaveClass('subtext');
        expect((options[0].querySelector('.pollBar') as HTMLElement).style.width).toBe('75%');
        expect((options[1].querySelector('.pollBar') as HTMLElement).style.width).toBe('25%');
    });

    it('flags an incomplete poll and skips the bar for options without points', async () => {
        fetchItemContent.mockResolvedValue(
            makeStory({
                type: 'poll',
                url: 'item?id=42',
                poll: [{ points: 10, content: 'Loaded option' }, { item: 'Failed option' } as unknown as PollResult],
                poll_votes_count: 10,
                poll_incomplete: true,
            })
        );
        const { container } = renderItem();

        await screen.findAllByRole('link', { name: 'A great story' });
        expect(screen.getByText('Some poll options could not be loaded.')).toHaveClass('subtext');
        const bars = container.querySelectorAll('.pollContent .pollBar');
        expect((bars[0] as HTMLElement).style.width).toBe('100%');
        expect((bars[1] as HTMLElement).style.width).toBe('');
        expect(screen.getByText('? points')).toBeInTheDocument();
    });

    it('shows the Angular error message when the request fails', async () => {
        fetchItemContent.mockRejectedValue(new api.HttpError(500, 'https://node-hnapi.herokuapp.com/item/42'));
        renderItem();

        expect(await screen.findByText('Could not load item comments.')).toBeInTheDocument();
        expect(screen.queryByText('Loading...')).toBeNull();
    });

    it('shows the error message instead of an endless loader for an invalid id', () => {
        renderItem('/item/abc');

        expect(screen.getByText('Could not load item comments.')).toBeInTheDocument();
        expect(screen.queryByText('Loading...')).toBeNull();
        expect(fetchItemContent).not.toHaveBeenCalled();
    });

    it('scrolls to the top once on route entry, not again when the item refetches', async () => {
        fetchItemContent.mockResolvedValue(makeStory());
        const { rerender } = renderItem();
        await screen.findAllByRole('link', { name: 'A great story' });
        expect(window.scrollTo).toHaveBeenCalledTimes(1);

        rerender(
            <QueryClientProvider client={createQueryClient()}>
                <MemoryRouter initialEntries={['/item/42']}>
                    <Routes>
                        <Route path="/item/:id" element={<ItemDetails />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        );
        await screen.findAllByRole('link', { name: 'A great story' });
        expect(window.scrollTo).toHaveBeenCalledTimes(1);
    });

    it('strips scripts and event handlers from injected story content', async () => {
        fetchItemContent.mockResolvedValue(
            makeStory({
                url: 'item?id=42',
                content: '<p onclick="alert(1)">Ask text</p><script>alert(1)</script><a href="javascript:alert(1)">bad</a>',
            })
        );
        const { container } = renderItem();

        await screen.findByText('Ask text');
        expect(container.querySelector('.subject')?.innerHTML).toBe('<p>Ask text</p><a>bad</a>');
    });

    it('navigates back when the mobile back button is clicked', async () => {
        fetchItemContent.mockResolvedValue(makeStory());
        const { container } = renderItem();

        await screen.findAllByRole('link', { name: 'A great story' });
        fireEvent.click(container.querySelector('.back-button') as HTMLElement);

        await waitFor(() => expect(screen.getByText('feed page')).toBeInTheDocument());
    });
});
