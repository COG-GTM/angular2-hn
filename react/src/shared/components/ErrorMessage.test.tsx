import { render, screen } from '@testing-library/react';

import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
    it('renders the message, offline note, and skull markup', () => {
        render(<ErrorMessage message="Something went wrong" />);

        expect(screen.getByText('Something went wrong')).toHaveClass('strong');
        expect(
            screen.getByText(
                "If you are offline viewing, you'll need to visit this page with a network connection first before it can work offline."
            )
        ).toBeInTheDocument();
        expect(document.querySelector('.error-section')).toBeInTheDocument();
        expect(document.querySelector('.skull .head .crack')).toBeInTheDocument();
        expect(document.querySelector('.skull .mouth .teeth')).toBeInTheDocument();
    });
});
