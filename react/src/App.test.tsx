import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

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
    it.each([
        ['/news/1', 'not-ported-feed:news'],
        ['/newest/1', 'not-ported-feed:newest'],
        ['/show/1', 'not-ported-feed:show'],
        ['/ask/1', 'not-ported-feed:ask'],
        ['/jobs/1', 'not-ported-feed:jobs'],
        ['/item/123', 'not-ported-item-details'],
        ['/user/pg', 'not-ported-user'],
    ])('routes %s to its component slot', (path, testId) => {
        renderAt(path);
        expect(screen.getByTestId(testId)).toBeInTheDocument();
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
