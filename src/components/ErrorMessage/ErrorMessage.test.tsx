import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
    it('renders the message and the offline hint', () => {
        render(<ErrorMessage message="Could not load news stories." />);

        expect(screen.getByText('Could not load news stories.')).toHaveClass('strong');
        expect(screen.getByText(/If you are offline viewing/)).toBeInTheDocument();
    });

    it('renders the skull illustration', () => {
        const { container } = render(<ErrorMessage message="Boom" />);

        expect(container.querySelector('.skull .head .crack')).toBeInTheDocument();
        expect(container.querySelector('.skull .mouth .teeth')).toBeInTheDocument();
    });
});
