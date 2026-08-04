import { render, screen } from '@testing-library/react';
import Loader from './Loader';

describe('Loader', () => {
    it('renders the loading text', () => {
        render(<Loader />);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders the loading section wrapper', () => {
        const { container } = render(<Loader />);

        expect(container.querySelector('.loading-section .loader')).toBeInTheDocument();
    });
});
