import { render, screen } from '@testing-library/react';

import App from './App';
import * as api from './api/hackerNewsApi';
import { makeStory } from './test/fixtures';

vi.mock('./api/hackerNewsApi');

beforeEach(() => {
    vi.mocked(api.fetchFeed).mockReset();
    vi.mocked(api.fetchFeed).mockResolvedValue([makeStory()]);
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

describe('App', () => {
    it('renders the themed app shell with the header, routes and footer', async () => {
        const { container } = render(<App />);

        expect(container.querySelector('.default')).toBeInTheDocument();
        expect(container.querySelector('.body-cover')).toBeInTheDocument();
        expect(container.querySelector('.wrapper')).toBeInTheDocument();
        expect(screen.getByRole('banner')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
        expect(await screen.findByText('A linked story')).toBeInTheDocument();
    });

    it('applies the theme stored in settings', async () => {
        localStorage.setItem('theme', 'night');

        const { container } = render(<App />);

        expect(container.querySelector('.night')).toBeInTheDocument();
        await screen.findByText('A linked story');
    });
});
