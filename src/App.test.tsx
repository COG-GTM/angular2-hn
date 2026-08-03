import { render } from '@testing-library/react';

import App from './App';

describe('App', () => {
    it('renders the themed app shell', () => {
        const { container } = render(<App />);

        expect(container.querySelector('.default')).toBeInTheDocument();
        expect(container.querySelector('.body-cover')).toBeInTheDocument();
        expect(container.querySelector('.wrapper')).toBeInTheDocument();
    });

    it('applies the theme stored in settings', () => {
        localStorage.setItem('theme', 'night');

        const { container } = render(<App />);

        expect(container.querySelector('.night')).toBeInTheDocument();
    });
});
