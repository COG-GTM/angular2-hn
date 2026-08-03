import { render, screen } from '@testing-library/react';

import App from './App';

describe('App', () => {
    it('renders the themed app shell with the header and footer', () => {
        const { container } = render(<App />);

        expect(container.querySelector('.default')).toBeInTheDocument();
        expect(container.querySelector('.body-cover')).toBeInTheDocument();
        expect(container.querySelector('.wrapper')).toBeInTheDocument();
        expect(screen.getByRole('banner')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
    });

    it('applies the theme stored in settings', () => {
        localStorage.setItem('theme', 'night');

        const { container } = render(<App />);

        expect(container.querySelector('.night')).toBeInTheDocument();
    });
});
