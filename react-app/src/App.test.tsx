import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { App } from './App';
import { jsonResponse, makeComment, makeStory, mockFetch, user } from './test/fixtures';
import { renderWithProviders } from './test/render';

const page = (n: number, count = 30) =>
    Array.from({ length: count }, (_, i) => makeStory({ id: n * 100 + i, title: `Story ${n}-${i}` }));

function mockApi() {
    return mockFetch((url) => {
        const feed = url.match(/herokuapp\.com\/(news|newest|show|ask|jobs)\?page=(\d+)/);
        if (feed) {
            const n = Number(feed[2]);
            return jsonResponse(page(n, n === 3 ? 5 : 30).map((s) => ({ ...s, title: `${feed[1]} ${s.title}` })));
        }
        if (url.endsWith('/item/7')) {
            return jsonResponse(
                makeStory({
                    id: 7,
                    title: 'Ask HN: Item seven',
                    type: 'ask',
                    url: 'item?id=7',
                    content: '<p>Body text</p>',
                    comments: [
                        makeComment({
                            id: 1,
                            user: 'alice',
                            content: 'Parent comment',
                            comments: [makeComment({ id: 2, user: 'bob', content: 'Child comment' })],
                        }),
                        makeComment({ id: 3, deleted: true }),
                    ],
                })
            );
        }
        if (url.includes('/user/pg')) return jsonResponse(user);
        return jsonResponse({}, 404);
    });
}

describe('App routes', () => {
    it('redirects / to /news/1 and renders the feed', async () => {
        mockApi();
        renderWithProviders(<App />, { route: '/' });
        expect(await screen.findByText('news Story 1-0')).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(30);
        expect(screen.queryByText('‹ Prev')).not.toBeInTheDocument();
        expect(screen.getByText('More ›')).toHaveAttribute('href', '/news/2');
    });

    it.each(['newest', 'show', 'ask', 'jobs'])('renders the %s feed with numbering and pagination', async (feed) => {
        mockApi();
        renderWithProviders(<App />, { route: `/${feed}/2` });
        expect(await screen.findByText(`${feed} Story 2-0`)).toBeInTheDocument();
        expect(screen.getByRole('list')).toHaveAttribute('start', '31');
        expect(screen.getByText('‹ Prev')).toHaveAttribute('href', `/${feed}/1`);
        expect(screen.getByText('More ›')).toHaveAttribute('href', `/${feed}/3`);
        expect(screen.queryByText(/jobs at startups/) !== null).toBe(feed === 'jobs');
    });

    it('shows the jobs header only on /jobs', async () => {
        mockApi();
        renderWithProviders(<App />, { route: '/jobs/1' });
        expect(await screen.findByText(/These are jobs at startups/)).toBeInTheDocument();
    });

    it('hides More on a short last page', async () => {
        mockApi();
        renderWithProviders(<App />, { route: '/news/3' });
        expect(await screen.findByText('news Story 3-0')).toBeInTheDocument();
        expect(screen.queryByText('More ›')).not.toBeInTheDocument();
    });

    it('shows the error message when the feed fails', async () => {
        mockFetch(() => jsonResponse({}, 503));
        renderWithProviders(<App />, { route: '/show/1' });
        expect(await screen.findByText('Could not load show stories.')).toBeInTheDocument();
    });

    it('paginates via the More link', async () => {
        mockApi();
        renderWithProviders(<App />, { route: '/news/1' });
        await userEvent.click(await screen.findByText('More ›'));
        expect(await screen.findByText('news Story 2-0')).toBeInTheDocument();
        expect(screen.getByText('‹ Prev')).toHaveAttribute('href', '/news/1');
    });

    it('renders item details with a recursive, collapsible comment tree', async () => {
        mockApi();
        renderWithProviders(<App />, { route: '/item/7' });
        expect((await screen.findAllByText('Ask HN: Item seven')).length).toBeGreaterThan(0);
        expect(screen.getByText('Body text')).toBeInTheDocument();
        expect(screen.getByText('Child comment')).toBeVisible();
        expect(screen.getByText('Comment Deleted', { exact: false })).toBeInTheDocument();

        const parentMeta = screen.getByRole('link', { name: 'alice' }).parentElement!;
        await userEvent.click(within(parentMeta).getByText('[-]'));
        expect(within(parentMeta).getByText('[+]')).toBeInTheDocument();
        expect(screen.getByText('Child comment')).not.toBeVisible();
        expect(screen.getByText('Parent comment')).not.toBeVisible();
    });

    it('renders the user profile', async () => {
        mockApi();
        renderWithProviders(<App />, { route: '/user/pg' });
        expect(await screen.findByText('157316 ★')).toBeInTheDocument();
        expect(screen.getByText('Created 20 years ago')).toBeInTheDocument();
        expect(screen.getByText('Bug fixer.').tagName).toBe('I');
    });

    it('does not match feed routes without a page (same as the Angular route map)', () => {
        mockApi();
        const { container } = renderWithProviders(<App />, { route: '/news' });
        expect(container.querySelector('.app-feed')).toBeNull();
        expect(screen.getByText('GitHub')).toBeInTheDocument();
    });
});

describe('Header and settings', () => {
    it('opens settings, switches theme and closes', async () => {
        mockApi();
        renderWithProviders(<App />, { route: '/news/1' });
        await userEvent.click(screen.getByAltText('Settings'));
        const dialog = screen.getByRole('dialog', { name: 'Settings' });

        await userEvent.click(within(dialog).getByLabelText('Night'));
        expect(document.documentElement).toHaveClass('night');
        await userEvent.click(within(dialog).getByLabelText('Black (AMOLED)'));
        expect(document.documentElement).toHaveClass('amoledblack');
        expect(document.documentElement).not.toHaveClass('night');

        await userEvent.click(screen.getByLabelText('Close settings'));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('applies open-in-new-tab and font size to feed items', async () => {
        mockApi();
        renderWithProviders(<App />, { route: '/news/1' });
        const title = await screen.findByText('news Story 1-0');
        expect(title).not.toHaveAttribute('target');

        await userEvent.click(screen.getByAltText('Settings'));
        await userEvent.click(screen.getByLabelText('Open links in a new tab'));
        const font = screen.getByLabelText('Font size:');
        await userEvent.clear(font);
        await userEvent.type(font, '22');

        expect(title).toHaveAttribute('target', '_blank');
        expect(title).toHaveAttribute('rel', 'noopener');
        expect(title).toHaveStyle({ fontSize: '22px' });
    });

    it('marks the active nav link', async () => {
        mockApi();
        renderWithProviders(<App />, { route: '/show/1' });
        expect(screen.getByRole('link', { name: 'show' })).toHaveClass('active');
        expect(screen.getByRole('link', { name: 'ask' })).not.toHaveClass('active');
    });
});
