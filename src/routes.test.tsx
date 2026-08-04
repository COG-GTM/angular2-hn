import { render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation, useRoutes } from 'react-router-dom';

import { routes } from './routes';
import { Story, User as UserModel } from './shared/models';
import { fetchFeed, fetchItemContent, fetchUser } from './shared/services/hackernews-api';
import { SettingsProvider } from './shared/services/settings-context';

jest.mock('./shared/services/hackernews-api', () => ({
    ...jest.requireActual('./shared/services/hackernews-api'),
    fetchFeed: jest.fn(),
    fetchItemContent: jest.fn(),
    fetchUser: jest.fn(),
}));

const fetchFeedMock = fetchFeed as jest.MockedFunction<typeof fetchFeed>;
const fetchItemContentMock = fetchItemContent as jest.MockedFunction<typeof fetchItemContent>;
const fetchUserMock = fetchUser as jest.MockedFunction<typeof fetchUser>;

const story: Story = {
    id: 123,
    title: 'A routed story',
    points: 10,
    user: 'pg',
    time: 1600000000,
    time_ago: '2 hours ago',
    type: 'story',
    url: 'https://example.com/story',
    domain: 'example.com',
    comments_count: 0,
    comments: [],
};

const profile: UserModel = {
    id: 'foo',
    crated_time: 1160418092,
    created: 'October 9, 2006',
    karma: 1234,
    avg: 6,
};

function AppRoutes() {
    return useRoutes(routes);
}

function LocationDisplay() {
    return <span data-testid="pathname">{useLocation().pathname}</span>;
}

function currentPathname() {
    return screen.getByTestId('pathname').textContent;
}

function renderRoute(route: string) {
    return render(
        <SettingsProvider>
            <MemoryRouter initialEntries={[route]}>
                <AppRoutes />
                <LocationDisplay />
            </MemoryRouter>
        </SettingsProvider>
    );
}

beforeEach(() => {
    localStorage.clear();
    fetchFeedMock.mockReset();
    fetchItemContentMock.mockReset();
    fetchUserMock.mockReset();
    fetchFeedMock.mockResolvedValue([story]);
    fetchItemContentMock.mockResolvedValue(story);
    fetchUserMock.mockResolvedValue(profile);
    window.scrollTo = jest.fn();
});

describe('routes', () => {
    it('redirects the index route to /news/1', async () => {
        renderRoute('/');

        expect(await screen.findByRole('link', { name: 'A routed story' })).toBeInTheDocument();
        expect(currentPathname()).toBe('/news/1');
        expect(fetchFeedMock).toHaveBeenCalledWith('news', 1, expect.any(AbortSignal));
    });

    it('redirects a feed route without a page to page 1', async () => {
        renderRoute('/show');

        expect(await screen.findByRole('link', { name: 'A routed story' })).toBeInTheDocument();
        expect(currentPathname()).toBe('/show/1');
    });

    it('renders the feed with the feed type of the matched route', async () => {
        renderRoute('/jobs/1');

        expect(await screen.findByRole('link', { name: 'A routed story' })).toBeInTheDocument();
        expect(fetchFeedMock).toHaveBeenCalledWith('jobs', 1, expect.any(AbortSignal));
    });

    it('lazily renders the item details page', async () => {
        renderRoute('/item/123');

        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(await screen.findAllByRole('link', { name: 'A routed story' })).not.toHaveLength(0);
        expect(fetchItemContentMock).toHaveBeenCalledWith(123, expect.any(AbortSignal));
    });

    it('lazily renders the user page', async () => {
        renderRoute('/user/foo');

        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(await screen.findByText('1234 ★')).toBeInTheDocument();
        expect(fetchUserMock).toHaveBeenCalledWith('foo', expect.any(AbortSignal));
    });

    it('redirects unknown routes to /news/1', async () => {
        renderRoute('/does-not-exist');

        expect(await screen.findByRole('link', { name: 'A routed story' })).toBeInTheDocument();
        expect(currentPathname()).toBe('/news/1');
    });
});
