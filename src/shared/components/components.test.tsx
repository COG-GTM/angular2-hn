import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ErrorMessage, Loader } from './index';

describe('Loader', () => {
    it('renders the Angular loader markup as a status region', () => {
        const { container } = render(<Loader />);
        expect(screen.getByRole('status')).toHaveClass('loading-section');
        expect(container.querySelector('.loading-section > .loader')).toHaveTextContent('Loading...');
    });
});

describe('ErrorMessage', () => {
    it('renders the message, the skull and the offline hint', () => {
        const { container } = render(<ErrorMessage message="Could not load item comments." />);
        const alert = screen.getByRole('alert');
        expect(alert).toHaveClass('error-section');
        expect(container.querySelector('p.strong')).toHaveTextContent('Could not load item comments.');
        expect(container.querySelector('.skull .head .crack')).toBeInTheDocument();
        expect(container.querySelector('.skull .mouth .teeth')).toBeInTheDocument();
        expect(alert).toHaveTextContent(/visit this page with a network connection first/);
    });
});
