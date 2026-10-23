import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Layout } from '../App';
import { renderWithProviders } from '../test';
import { ErrorMessage, Footer, Loader } from './index';

describe('Loader', () => {
    it('renders the Angular markup', () => {
        const { container } = render(<Loader />);
        expect(container.querySelector('.loading-section > .loader')).toHaveTextContent('Loading...');
        expect(screen.getByRole('status')).toHaveClass('loading-section');
    });
});

describe('ErrorMessage', () => {
    it('renders the message, the skull and the offline hint', () => {
        const { container } = render(<ErrorMessage message="Could not load user" />);
        expect(screen.getByRole('alert')).toHaveClass('error-section');
        expect(screen.getByText('Could not load user')).toHaveClass('strong');
        expect(container.querySelector('.error-section .skull .head .crack')).toBeInTheDocument();
        expect(container.querySelector('.error-section .skull .mouth .teeth')).toBeInTheDocument();
        expect(screen.getByText(/you'll need to visit this page with a network connection first/)).toBeInTheDocument();
    });
});

describe('Footer', () => {
    it('links to the GitHub project in a new tab', () => {
        const { container } = render(<Footer />);
        expect(container.querySelector('#footer')).toHaveTextContent('Show this project some ❤ on GitHub');
        const link = screen.getByRole('link', { name: 'GitHub' });
        expect(link).toHaveAttribute('href', 'https://github.com/hdjirdeh/angular2-hn');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener');
    });
});

describe('shell in the App layout', () => {
    it('renders header and footer inside the themed wrapper and opens settings from the cog', async () => {
        window.localStorage.setItem('theme', 'amoledblack');
        const { container, user } = renderWithProviders(<Layout />, { route: '/news/1' });
        const wrapper = container.querySelector('.amoledblack > .wrapper');
        expect(wrapper?.querySelector('header #header')).toBeInTheDocument();
        expect(wrapper?.querySelector('#footer')).toBeInTheDocument();
        expect(wrapper?.querySelector('#popup1')).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Settings' }));
        expect(wrapper?.querySelector('#popup1')).toBeInTheDocument();

        await user.click(screen.getByRole('radio', { name: 'Night' }));
        expect(container.querySelector('.night > .wrapper')).toBeInTheDocument();
        expect(window.localStorage.getItem('theme')).toBe('night');
    });
});
