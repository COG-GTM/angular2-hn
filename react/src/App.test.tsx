import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from './App';
import { SettingsProvider } from './settings/SettingsContext';

const { fetchFeed } = vi.hoisted(() => ({ fetchFeed: vi.fn(() => new Promise(() => {})) }));

vi.mock('./api/hackerNewsApi', () => ({
    fetchFeed,
    fetchItemContent: vi.fn(),
    fetchUser: vi.fn(),
    fetchPollContent: vi.fn(),
}));

function renderAt(path: string) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <SettingsProvider>
                <App />
            </SettingsProvider>
        </MemoryRouter>
    );
}

describe('App routing', () => {
    beforeEach(() => {
        fetchFeed.mockClear();
    });

    it.each([
        ['/item/123', 'not-ported-item-details'],
        ['/user/pg', 'not-ported-user'],
    ])('routes %s to its component slot', (path, testId) => {
        renderAt(path);
        expect(screen.getByTestId(testId)).toBeInTheDocument();
    });

    it.each([['/news/1', 'news'], ['/newest/1', 'newest'], ['/show/1', 'show'], ['/ask/1', 'ask'], ['/jobs/1', 'jobs']])(
        'routes %s to the feed component',
        (path, feedType) => {
            renderAt(path);
            expect(fetchFeed).toHaveBeenCalledWith(feedType, 1, expect.anything());
        }
    );

    it('redirects the root path to the news feed, as the Angular router did', () => {
        renderAt('/');
        expect(fetchFeed).toHaveBeenCalledWith('news', 1, expect.anything());
    });

    it('applies the active theme class to the app wrapper', () => {
        const { container } = renderAt('/news/1');
        expect(container.querySelector('.default')).toBeInTheDocument();
    });
});
