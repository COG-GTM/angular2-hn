import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type { Story, User } from './shared/models';
import { hackerNewsApi } from './shared/services/hackernews-api';
import App from './App';

vi.mock('./shared/services/hackernews-api', () => ({
    hackerNewsApi: {
        fetchFeed: vi.fn(),
        fetchItemContent: vi.fn(),
        fetchPollContent: vi.fn(),
        fetchUser: vi.fn(),
    },
}));

function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 1,
        title: 'Mocked story title',
        points: 10,
        user: 'alice',
        time: 0,
        time_ago: '1 hour ago' as unknown as number,
        type: 'story',
        url: 'https://example.com/story',
        domain: 'example.com',
        comments: [],
        comments_count: 1,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
        ...overrides,
    };
}

function makeUser(id = 'x'): User {
    return {
        id,
        crated_time: 0,
        created: '2 years ago',
        karma: 123,
        avg: 4.5,
        about: '',
    };
}

function renderApp(initialEntries: string[]) {
    return render(
        <MemoryRouter initialEntries={initialEntries}>
            <App />
        </MemoryRouter>
    );
}

describe('App', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.mocked(hackerNewsApi.fetchFeed).mockReset();
        vi.mocked(hackerNewsApi.fetchItemContent).mockReset();
        vi.mocked(hackerNewsApi.fetchUser).mockReset();
        vi.stubGlobal('scrollTo', vi.fn());
    });

    it('redirects to the news feed and renders the layout', async () => {
        vi.mocked(hackerNewsApi.fetchFeed).mockResolvedValueOnce([makeStory()]);

        renderApp(['/']);

        expect(await screen.findByText('Mocked story title')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'Logo' })).toBeInTheDocument();
    });

    it('renders the lazily loaded item details page', async () => {
        vi.mocked(hackerNewsApi.fetchItemContent).mockResolvedValueOnce(makeStory({ title: 'Mocked item title' }));

        renderApp(['/item/1']);

        expect(await screen.findByText('Mocked item title')).toBeInTheDocument();
    });

    it('renders the lazily loaded user profile page', async () => {
        vi.mocked(hackerNewsApi.fetchUser).mockResolvedValueOnce(makeUser());

        renderApp(['/user/x']);

        expect(await screen.findByText('Profile: x')).toBeInTheDocument();
    });

    it('renders the jobs feed header', async () => {
        vi.mocked(hackerNewsApi.fetchFeed).mockResolvedValueOnce([makeStory({ type: 'job' })]);

        renderApp(['/jobs/1']);

        expect(await screen.findByText(/These are jobs at startups/)).toBeInTheDocument();
    });
});
