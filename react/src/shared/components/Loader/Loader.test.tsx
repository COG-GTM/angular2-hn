import { render, screen } from '@testing-library/react';
import { Loader } from './Loader';

describe('Loader', () => {
    it('renders an accessible loading indicator', () => {
        render(<Loader />);
        expect(screen.getByRole('status')).toHaveTextContent('Loading...');
        expect(screen.getByText('Loading...')).toHaveClass('loader');
    });
});
