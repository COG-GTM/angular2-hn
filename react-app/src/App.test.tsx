import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';
import { fetchFeed } from './shared/api/hackernews-api';
import { renderWithProviders } from './test/renderWithProviders';

vi.mock('./shared/api/hackernews-api', () => ({
    fetchFeed: vi.fn(),
}));

describe('App', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.mocked(fetchFeed).mockResolvedValue([]);
        vi.stubGlobal('scrollTo', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('applies the current theme to the shell and renders header, routes and footer', () => {
        localStorage.setItem('theme', 'night');

        const { container } = renderWithProviders(<App />, { route: '/news/1' });

        expect(container.querySelector('.night')).not.toBeNull();
        expect(screen.getByRole('img', { name: 'Logo' })).toBeInTheDocument();
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
    });

    it('sends a Google Analytics pageview for the current route', () => {
        const ga = vi.fn();
        vi.stubGlobal('ga', ga);

        renderWithProviders(<App />, { route: '/user/pg' });

        expect(ga).toHaveBeenCalledWith('set', 'page', '/user/pg');
        expect(ga).toHaveBeenCalledWith('send', 'pageview');
    });

    it('does not break when Google Analytics is unavailable', () => {
        expect(() => renderWithProviders(<App />, { route: '/news/1' })).not.toThrow();
    });
});
