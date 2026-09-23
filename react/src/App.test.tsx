import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from './App';
import { SettingsProvider } from './settings/SettingsContext';

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
        vi.stubGlobal(
            'fetch',
            vi.fn(() => new Promise(() => {}))
        );
    });

    it.each([
        ['/news/1', 'not-ported-feed:news'],
        ['/newest/1', 'not-ported-feed:newest'],
        ['/show/1', 'not-ported-feed:show'],
        ['/ask/1', 'not-ported-feed:ask'],
        ['/jobs/1', 'not-ported-feed:jobs'],
        ['/user/pg', 'not-ported-user'],
    ])('routes %s to its component slot', (path, testId) => {
        renderAt(path);
        expect(screen.getByTestId(testId)).toBeInTheDocument();
    });

    it('routes /item/:id to the ported item details component', () => {
        const { container } = renderAt('/item/123');
        expect(container.querySelector('.main-content')).toBeInTheDocument();
        expect(screen.queryByTestId('not-ported-item-details')).not.toBeInTheDocument();
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
