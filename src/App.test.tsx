import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { SettingsProvider } from './context/SettingsContext';
import { fetchFeed } from './api/hackernews';
import { makeStory } from './test/fixtures';

vi.mock('./api/hackernews', () => ({
    fetchFeed: vi.fn(),
    fetchItemContent: vi.fn(),
    fetchUser: vi.fn(),
}));

const mockedFetchFeed = vi.mocked(fetchFeed);

function renderApp(route: string, children: (ui: ReactNode) => ReactNode = (ui) => ui) {
    return render(
        children(
            <MemoryRouter initialEntries={[route]}>
                <SettingsProvider>
                    <App />
                </SettingsProvider>
            </MemoryRouter>
        )
    );
}

describe('App', () => {
    beforeEach(() => {
        mockedFetchFeed.mockResolvedValue([makeStory({ id: 1, title: 'Front page story' })]);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders the header and footer chrome', async () => {
        renderApp('/news/1');
        expect(screen.getByAltText('Logo')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
        await screen.findByText('Front page story');
    });

    it('applies the current theme as the root wrapper class', async () => {
        const { container } = renderApp('/news/1');
        expect(container.firstChild).toHaveClass('default');
        await screen.findByText('Front page story');
    });

    it('redirects "/" to /news/1 and loads the news feed', async () => {
        renderApp('/');
        expect(await screen.findByText('Front page story')).toBeInTheDocument();
        expect(mockedFetchFeed).toHaveBeenCalledWith('news', 1);
    });

    it('fires a Google Analytics pageview on navigation', async () => {
        window.ga = vi.fn();
        renderApp('/news/1');
        await waitFor(() => expect(window.ga).toHaveBeenCalledWith('send', 'pageview'));
        expect(window.ga).toHaveBeenCalledWith('set', 'page', '/news/1');
    });
});
