import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';

import App from './App';
import { createQueryClient } from './shared/api/query-client';
import { loadInitialSettings, useSettingsStore } from './shared/store/settings';

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
        renderApp('/');

        expect(await screen.findByText('news', { selector: 'strong' })).toBeInTheDocument();
    });

    it.each(['news', 'newest', 'show', 'ask', 'jobs'])('renders the %s feed route', async (feedType) => {
        renderApp(`/${feedType}/2`);

        expect(await screen.findByText(feedType, { selector: 'strong' })).toBeInTheDocument();
        expect(screen.getByText(/page 2/)).toBeInTheDocument();
    });

    it('lazy-loads the item and user routes', async () => {
        vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
        const { container, unmount } = renderApp('/item/123');
        await waitFor(() => expect(container.querySelector('.app-item-details .loader')).not.toBeNull());
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
