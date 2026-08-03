import { render, screen } from '@testing-library/react';

import Loader from './Loader';

describe('Loader', () => {
    it('renders the loading indicator', () => {
        const { container } = render(<Loader />);

        expect(container.querySelector('.loading-section')).toBeInTheDocument();
        expect(screen.getByText('Loading...')).toHaveClass('loader');
    });
});
