import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as api from './api/hackernews';
import App from './App';

beforeEach(() => {
    localStorage.clear();
    window.history.pushState({}, '', '/');
    vi.stubGlobal('scrollTo', vi.fn());
    vi.spyOn(api, 'fetchFeed').mockResolvedValue([]);
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

describe('App', () => {
    it('renders the themed app shell with header and footer', () => {
        const { container } = render(<App />);

        expect(container.querySelector('.default')).toBeInTheDocument();
        expect(container.querySelector('.body-cover')).toBeInTheDocument();
        expect(container.querySelector('.wrapper')).toBeInTheDocument();
        expect(container.querySelector('#header')).toBeInTheDocument();
        expect(container.querySelector('#footer')).toBeInTheDocument();
    });

    it('redirects the root path to the news feed', () => {
        render(<App />);

        expect(window.location.pathname).toBe('/news/1');
        expect(screen.getByRole('link', { name: 'new' })).toBeInTheDocument();
    });

    it('applies the selected theme to the root element', () => {
        localStorage.setItem('theme', 'night');

        const { container } = render(<App />);

        expect(container.querySelector('.night')).toBeInTheDocument();
    });
});
