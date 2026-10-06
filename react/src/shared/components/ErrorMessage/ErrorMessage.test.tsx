import { render, screen } from '@testing-library/react';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
    it('renders the message and offline hint', () => {
        render(<ErrorMessage message="Could not load news stories." />);
        const alert = screen.getByRole('alert');
        expect(alert).toHaveClass('error-section');
        expect(screen.getByText('Could not load news stories.')).toHaveClass('strong');
        expect(alert).toHaveTextContent(/visit this page with a network connection first/);
        expect(alert.querySelector('.skull .head .crack')).not.toBeNull();
    });
});
