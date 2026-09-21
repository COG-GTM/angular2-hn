import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
    it('renders the message and the offline hint', () => {
        const { container } = render(<ErrorMessage message="Could not load news stories." />);

        expect(screen.getByText('Could not load news stories.')).toHaveClass('strong');
        expect(screen.getByText(/you'll need to visit this page with a network connection/)).toBeInTheDocument();
        expect(container.querySelector('.error-section .skull .head .crack')).toBeInTheDocument();
        expect(container.querySelector('.error-section .mouth .teeth')).toBeInTheDocument();
    });
});
