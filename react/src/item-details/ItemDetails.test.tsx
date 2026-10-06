import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useNavigate } from 'react-router-dom';
import type { Story } from '../shared/models';
import { fetchItemContent } from '../shared/services/hackernewsApi';
import { renderWithProviders } from '../test/renderWithProviders';
import ItemDetails from './ItemDetails';

vi.mock('../shared/services/hackernewsApi');
const mockFetchItemContent = vi.mocked(fetchItemContent);

function makeStory(overrides: Partial<Story> & { text?: string } = {}): Story {
    return {
        id: 42,
        title: 'A story',
        points: 120,
        user: 'pg',
        time: 0,
        time_ago: '3 hours ago',
        type: 'link',
        url: 'https://example.com/post',
        domain: 'example.com',
        content: '',
        comments_count: 2,
        comments: [
            {
                id: 100,
                level: 0,
                user: 'alice',
                time: 0,
                time_ago: '2 hours ago',
                content: '<p>First!</p>',
                comments: [
                    {
                        id: 101,
                        level: 1,
                        user: 'bob',
                        time: 0,
                        time_ago: '1 hour ago',
                        content: '<p>Reply</p>',
                        comments: [],
                    },
                ],
            },
        ],
        ...overrides,
    };
}

function GoTo({ to }: { to: string }) {
    const navigate = useNavigate();
    return <button onClick={() => navigate(to)}>go {to}</button>;
}

function renderItem(route = '/item/42') {
    return renderWithProviders(
        <>
            <Routes>
                <Route path="/item/:id" element={<ItemDetails />} />
                <Route path="*" element={<p>elsewhere</p>} />
            </Routes>
            <GoTo to="/item/43" />
        </>,
        { route }
    );
}

const laptopHeader = () => screen.getByTestId('laptop-header');
const mobileHeader = () => document.querySelector('.mobile.item-header') as HTMLElement;

beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

describe('ItemDetails', () => {
    it('shows the loader while loading and scrolls to top on mount', () => {
        mockFetchItemContent.mockReturnValue(new Promise<Story>(() => {}));
        renderItem();
        const root = screen.getByTestId('item-details');
        expect(root).toHaveAttribute('data-item-id', '42');
        expect(root).toHaveClass('main-content');
        expect(screen.getByRole('status')).toHaveTextContent('Loading...');
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
        expect(mockFetchItemContent).toHaveBeenCalledWith(42, expect.any(AbortSignal));
    });

    it('shows the error message when loading fails', async () => {
        mockFetchItemContent.mockRejectedValue(new Error('boom'));
        renderItem();
        expect(await screen.findByRole('alert')).toHaveTextContent('Could not load item comments.');
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
        expect(screen.getByTestId('item-details')).toHaveAttribute('data-item-id', '42');
    });

    it('ignores AbortError rejections', async () => {
        mockFetchItemContent.mockRejectedValue(new DOMException('aborted', 'AbortError'));
        renderItem();
        await act(async () => {});
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders a loaded story with external links, subtext and comments', async () => {
        mockFetchItemContent.mockResolvedValue(makeStory());
        const { container } = renderItem();
        await screen.findAllByText('A story');

        const header = laptopHeader();
        expect(header).toHaveClass('laptop', 'item-header');
        expect(header).not.toHaveClass('head-margin');
        const title = within(header).getByRole('link', { name: 'A story' });
        expect(title).toHaveAttribute('href', 'https://example.com/post');
        expect(title).not.toHaveAttribute('target');
        expect(title).not.toHaveAttribute('rel');
        expect(header.querySelector('.domain')).toHaveTextContent('(example.com)');

        const subtext = header.querySelector('.subtext')!;
        expect(subtext).toHaveTextContent('120 points by pg 3 hours ago | 2 comments');
        expect(within(subtext as HTMLElement).getByRole('link', { name: 'pg' })).toHaveAttribute('href', '/user/pg');
        expect(within(subtext as HTMLElement).getByRole('link', { name: '2 comments' })).toHaveAttribute(
            'href',
            '/item/42'
        );
        expect(subtext.querySelector('.item-details')).not.toBeNull();

        expect(within(mobileHeader()).getByRole('link', { name: 'A story' })).toHaveAttribute(
            'href',
            'https://example.com/post'
        );
        expect(container.querySelector('.pollResults')).toBeNull();

        const list = container.querySelector('ul.comment-list')!;
        expect(list.children).toHaveLength(1);
        expect(within(list as HTMLElement).getByText('First!')).toBeInTheDocument();
        expect(list.querySelector('.subtree')).toHaveTextContent('Reply');
    });

    it('opens external links in a new tab when the setting is on', async () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        mockFetchItemContent.mockResolvedValue(makeStory());
        renderItem();
        await screen.findAllByText('A story');
        for (const link of screen.getAllByRole('link', { name: 'A story' })) {
            expect(link).toHaveAttribute('target', '_blank');
            expect(link).toHaveAttribute('rel', 'noopener');
        }
    });

    it('uses internal links for stories without an http url and sanitizes content', async () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        mockFetchItemContent.mockResolvedValue(
            makeStory({
                type: 'ask',
                url: 'item?id=42',
                domain: undefined,
                comments_count: 0,
                comments: [],
                text: 'has text',
                content: '<p>Ask body <b>bold</b></p><img src="x" onerror="alert(1)"><script>alert(2)</script>',
            })
        );
        const { container } = renderItem();
        await screen.findAllByText('A story');

        for (const link of screen.getAllByRole('link', { name: 'A story' })) {
            expect(link).toHaveAttribute('href', '/item/42');
            expect(link).not.toHaveAttribute('target');
            expect(link).toHaveClass('title', 'active');
        }
        const header = laptopHeader();
        expect(header).not.toHaveClass('item-header');
        expect(header).toHaveClass('head-margin');
        expect(header.querySelector('.domain')).toBeNull();
        expect(header.querySelector('.subtext')).toHaveTextContent('| discuss');

        const subject = container.querySelector('p.subject')!;
        expect(subject.querySelector('b')).toHaveTextContent('bold');
        expect(subject.innerHTML).not.toMatch(/script|onerror/);
        expect(container.querySelector('ul.comment-list')).toBeEmptyDOMElement();
    });

    it('renders job items without points, user or comment count', async () => {
        mockFetchItemContent.mockResolvedValue(
            makeStory({ type: 'job', comments_count: 0, comments: [], points: 0, user: '' })
        );
        renderItem();
        await screen.findAllByText('A story');
        const header = laptopHeader();
        expect(header).toHaveClass('item-header');
        const subtext = header.querySelector('.subtext')!;
        expect(subtext).toHaveTextContent(/^\s*3 hours ago\s*$/);
        expect(subtext).not.toHaveTextContent('points');
        expect(subtext.querySelector('.item-details')).toBeNull();
    });

    it('treats a missing comment count as no comments', async () => {
        mockFetchItemContent.mockResolvedValue(makeStory({ comments_count: undefined, comments: undefined }));
        const { container } = renderItem();
        await screen.findAllByText('A story');
        expect(laptopHeader()).not.toHaveClass('item-header');
        expect(laptopHeader().querySelector('.subtext')).toHaveTextContent('| discuss');
        expect(container.querySelector('ul.comment-list')).toBeEmptyDOMElement();
    });

    it('renders poll results with proportional bars', async () => {
        mockFetchItemContent.mockResolvedValue(
            makeStory({
                type: 'poll',
                url: 'item?id=42',
                poll: [
                    { content: '<p>Yes <script>x()</script></p>', points: 30 },
                    { content: 'No', points: 10 },
                ],
                poll_votes_count: 40,
            })
        );
        renderItem();
        const options = await screen.findAllByTestId('poll-option');
        expect(options).toHaveLength(2);
        expect(options[0]).toHaveTextContent('Yes');
        expect(options[0].innerHTML).not.toMatch(/script/);
        expect(options[0].querySelector('.subtext')).toHaveTextContent('30 points');
        expect(options[0].querySelector<HTMLElement>('.pollBar')!.style.width).toBe('75%');
        expect(options[1].querySelector('.subtext')).toHaveTextContent('10 points');
        expect(options[1].querySelector<HTMLElement>('.pollBar')!.style.width).toBe('25%');
    });

    it('uses a zero-width bar when a poll has no votes', async () => {
        mockFetchItemContent.mockResolvedValue(
            makeStory({ type: 'poll', poll: [{ content: 'Maybe', points: 0 }], poll_votes_count: 0 })
        );
        renderItem();
        const [option] = await screen.findAllByTestId('poll-option');
        expect(option.querySelector<HTMLElement>('.pollBar')!.style.width).toBe('0%');
    });

    it('goes back with the mobile back button (click and keyboard)', async () => {
        const user = userEvent.setup();
        mockFetchItemContent.mockResolvedValue(makeStory());
        renderWithProviders(
            <Routes>
                <Route path="/item/:id" element={<ItemDetails />} />
                <Route path="/news/1" element={<GoTo to="/item/42" />} />
            </Routes>,
            { route: '/news/1' }
        );
        await user.click(screen.getByRole('button', { name: 'go /item/42' }));
        await screen.findAllByText('A story');
        await user.click(screen.getByRole('button', { name: 'Back' }));
        expect(screen.getByTestId('location')).toHaveTextContent('/news/1');

        await user.click(screen.getByRole('button', { name: 'go /item/42' }));
        await screen.findAllByText('A story');
        screen.getByRole('button', { name: 'Back' }).focus();
        await user.keyboard('{Enter}');
        expect(screen.getByTestId('location')).toHaveTextContent('/news/1');
    });

    it('aborts and refetches when the id changes', async () => {
        const user = userEvent.setup();
        mockFetchItemContent.mockImplementation((id) =>
            Promise.resolve(makeStory({ id, title: `Story ${id}`, comments: [] }))
        );
        renderItem('/item/42');
        await screen.findAllByText('Story 42');
        const firstSignal = mockFetchItemContent.mock.calls[0][1]!;

        await user.click(screen.getByRole('button', { name: 'go /item/43' }));
        expect(screen.getByTestId('item-details')).toHaveAttribute('data-item-id', '43');
        await screen.findAllByText('Story 43');
        expect(screen.queryByText('Story 42')).not.toBeInTheDocument();
        expect(firstSignal.aborted).toBe(true);
        expect(mockFetchItemContent).toHaveBeenLastCalledWith(43, expect.any(AbortSignal));
    });

    it('aborts the request on unmount', async () => {
        mockFetchItemContent.mockReturnValue(new Promise<Story>(() => {}));
        const { unmount } = renderItem();
        const signal = mockFetchItemContent.mock.calls[0][1]!;
        unmount();
        await waitFor(() => expect(signal.aborted).toBe(true));
    });
});
