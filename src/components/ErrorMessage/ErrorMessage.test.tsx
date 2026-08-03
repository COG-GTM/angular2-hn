import { render, screen } from '@testing-library/react';

import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
    it('renders the given message and the offline hint', () => {
        render(<ErrorMessage message="Could not load news stories." />);

        expect(screen.getByText('Could not load news stories.')).toHaveClass('strong');
        expect(screen.getByText(/you'll need to visit this page with a network connection/i)).toBeInTheDocument();
    });

    it('renders the skull illustration', () => {
        const { container } = render(<ErrorMessage message="Boom" />);

        expect(container.querySelector('.skull .head .crack')).toBeInTheDocument();
        expect(container.querySelector('.skull .mouth .teeth')).toBeInTheDocument();
    });
});
