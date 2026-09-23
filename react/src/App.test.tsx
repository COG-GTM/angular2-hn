import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { App } from './App';
import { SettingsProvider } from './settings/SettingsContext';

vi.mock('./api/hooks', () => ({
    useUser: () => ({ data: null, loading: true, error: null }),
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
    it.each([
        ['/news/1', 'not-ported-feed:news'],
        ['/newest/1', 'not-ported-feed:newest'],
        ['/show/1', 'not-ported-feed:show'],
        ['/ask/1', 'not-ported-feed:ask'],
        ['/jobs/1', 'not-ported-feed:jobs'],
        ['/item/123', 'not-ported-item-details'],
    ])('routes %s to its component slot', (path, testId) => {
        renderAt(path);
        expect(screen.getByTestId(testId)).toBeInTheDocument();
    });

    it('routes /user/:id to the ported User component', () => {
        const { container } = renderAt('/user/pg');
        expect(container.querySelector('.loading-section')).toBeInTheDocument();
        expect(screen.queryByTestId('not-ported-user')).not.toBeInTheDocument();
    });

    it('redirects the root path to the news feed, as the Angular router did', () => {
        renderAt('/');
        expect(screen.getByTestId('not-ported-feed:news')).toBeInTheDocument();
    });

    it('applies the active theme class to the app wrapper', () => {
        const { container } = renderAt('/news/1');
        expect(container.querySelector('.default')).toBeInTheDocument();
    });
});
