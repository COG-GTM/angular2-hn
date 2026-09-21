import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from './App';
import { renderWithProviders, mockMatchMedia } from './test/utils';

beforeEach(() => {
    localStorage.clear();
    mockMatchMedia(false);
});

describe('App', () => {
    it('renders the shell with the active theme class', () => {
        const { container } = renderWithProviders(<App />, { route: '/news/1' });

        expect(container.querySelector('.default .wrapper')).toBeInTheDocument();
        expect(screen.getByAltText('Logo')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
    });

    it('redirects the root route to the news feed', () => {
        renderWithProviders(<App />, { route: '/' });

        expect(screen.getByRole('link', { name: 'new' })).toBeInTheDocument();
        expect(window.location.pathname).toBe('/');
    });

    it('tracks page views when Google Analytics is available', () => {
        const ga = vi.fn();
        window.ga = ga;

        renderWithProviders(<App />, { route: '/show/1' });

        expect(ga).toHaveBeenCalledWith('set', 'page', '/show/1');
        expect(ga).toHaveBeenCalledWith('send', 'pageview');
        delete window.ga;
    });

    it('does not fail when Google Analytics is undefined', () => {
        delete window.ga;

        expect(() => renderWithProviders(<App />, { route: '/ask/1' })).not.toThrow();
    });
});
