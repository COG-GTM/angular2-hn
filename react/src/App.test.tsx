import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import App from './App';
import { mockMatchMedia } from './test/matchMedia';

describe('App', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('wraps the routes in the active theme class and redirects to the news feed', async () => {
        mockMatchMedia(false);
        const { container } = render(
            <MemoryRouter initialEntries={['/']}>
                <App />
            </MemoryRouter>
        );
        expect(container.firstElementChild).toHaveClass('default');
        expect(container.querySelector('.wrapper')).not.toBeNull();
        expect(await screen.findByTestId('feed-page')).toHaveAttribute('data-feed-type', 'news');
    });

    it('applies the saved theme class', () => {
        mockMatchMedia(false);
        localStorage.setItem('theme', 'night');
        const { container } = render(
            <MemoryRouter initialEntries={['/ask/2']}>
                <App />
            </MemoryRouter>
        );
        expect(container.firstElementChild).toHaveClass('night');
    });
});
