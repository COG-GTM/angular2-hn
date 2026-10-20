import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';

import App from './App';
import * as api from './shared/api/hackernews-api';
import { createQueryClient } from './shared/api/query-client';
import type { Story } from './shared/models';
import { loadInitialSettings, useSettingsStore } from './shared/store/settings';

vi.mock('./shared/api/hackernews-api', async (importOriginal) => {
    const original = await importOriginal<typeof api>();
    return { ...original, fetchFeed: vi.fn() };
});

const story: Story = {
    id: 1,
    title: 'Hello HN',
    points: 1,
    user: 'pg',
    time: 1,
    time_ago: '1 hour ago',
    type: 'link',
    url: 'https://example.com',
    domain: 'example.com',
    comments: [],
    comments_count: 0,
};

function renderApp(path: string) {
    return render(
        <QueryClientProvider client={createQueryClient()}>
            <MemoryRouter initialEntries={[path]}>
                <App />
            </MemoryRouter>
        </QueryClientProvider>
    );
}

describe('App shell', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
        useSettingsStore.setState(loadInitialSettings());
        vi.stubGlobal('scrollTo', vi.fn());
        vi.mocked(api.fetchFeed).mockResolvedValue([story]);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('renders header nav, footer and applies the theme class on the root', () => {
        const { container } = renderApp('/news/1');

        expect(container.firstElementChild).toHaveClass('default');
        expect(screen.getByRole('link', { name: 'new' })).toHaveAttribute('href', '/newest/1');
        expect(screen.getByRole('link', { name: 'jobs' })).toHaveAttribute('href', '/jobs/1');
        expect(screen.getByText(/Show this project some/)).toBeInTheDocument();
    });

    it('redirects / to /news/1 and renders the feed route', async () => {
        const { container } = renderApp('/');

        expect(await screen.findByText('Hello HN')).toBeInTheDocument();
        expect(api.fetchFeed).toHaveBeenCalledWith('news', 1, expect.anything());
        expect(container.querySelector('.app-feed ol')).toHaveAttribute('start', '1');
    });

    it.each(['news', 'newest', 'show', 'ask', 'jobs'])('renders the %s feed route', async (feedType) => {
        const { container } = renderApp(`/${feedType}/2`);

        expect(await screen.findByText('Hello HN')).toBeInTheDocument();
        expect(api.fetchFeed).toHaveBeenCalledWith(feedType, 2, expect.anything());
        expect(container.querySelector('.app-feed ol')).toHaveAttribute('start', '31');
    });

    it('lazy-loads the item and user routes', async () => {
        const { unmount } = renderApp('/item/123');
        expect(await screen.findByText(/Item 123/)).toBeInTheDocument();
        unmount();

        renderApp('/user/pg');
        expect(await screen.findByText(/User pg/)).toBeInTheDocument();
    });

    it('toggles the settings popup and switches theme', async () => {
        const { container } = renderApp('/news/1');

        screen.getByRole('button', { name: 'Settings' }).click();
        const night = await screen.findByLabelText('Night');
        night.click();

        expect(container.firstElementChild).toHaveClass('night');
        expect(localStorage.getItem('theme')).toBe('night');
    });
});
