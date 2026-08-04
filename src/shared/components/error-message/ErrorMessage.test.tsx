import { render, screen } from '@testing-library/react';
import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
    it('renders the passed message', () => {
        render(<ErrorMessage message="Something went wrong." />);

        expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    });

    it('renders the offline viewing paragraph', () => {
        render(<ErrorMessage message="Something went wrong." />);

        expect(
            screen.getByText(
                "If you are offline viewing, you'll need to visit this page with a network connection first before it can work offline."
            )
        ).toBeInTheDocument();
    });

    it('renders the skull markup', () => {
        const { container } = render(<ErrorMessage message="Something went wrong." />);

        expect(container.querySelector('.error-section .skull .head .crack')).toBeInTheDocument();
        expect(container.querySelector('.error-section .skull .mouth .teeth')).toBeInTheDocument();
    });
});
