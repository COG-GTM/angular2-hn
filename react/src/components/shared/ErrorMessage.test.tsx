import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
    it('renders the message passed in, as the Angular @Input did', () => {
        render(<ErrorMessage message="Sorry, an error occurred." />);

        expect(screen.getByText('Sorry, an error occurred.')).toHaveClass('strong');
    });

    it('renders the skull graphic and the offline hint', () => {
        const { container } = render(<ErrorMessage message="boom" />);

        expect(container.querySelector('.skull .head .crack')).toBeInTheDocument();
        expect(container.querySelector('.skull .mouth .teeth')).toBeInTheDocument();
        expect(screen.getByText(/you'll need to visit this page with a network connection first/)).toBeInTheDocument();
    });
});
