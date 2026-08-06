import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
    it('renders the given message along with the offline hint', () => {
        const { container } = render(<ErrorMessage message="Could not load news stories." />);

        expect(screen.getByText('Could not load news stories.')).toHaveClass('strong');
        expect(screen.getByText(/you'll need to visit this page with a network connection first/)).toBeInTheDocument();
        expect(container.querySelector('.error-section .skull .head .crack')).not.toBeNull();
        expect(container.querySelector('.error-section .skull .mouth .teeth')).not.toBeNull();
    });
});
