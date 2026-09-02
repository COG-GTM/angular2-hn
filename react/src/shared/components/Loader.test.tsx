import { render, screen } from '@testing-library/react';

import { Loader } from './Loader';

describe('Loader', () => {
    it('renders the loading indicator', () => {
        render(<Loader />);
        const loader = screen.getByText('Loading...');
        expect(loader).toHaveClass('loader');
        expect(loader.parentElement).toHaveClass('loading-section');
    });
});
