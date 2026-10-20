import { render, screen } from '@testing-library/react';

import { Loader } from './Loader';

describe('Loader', () => {
    it('renders the Angular loader markup (loading-section > loader) under the wrapper class', () => {
        const { container } = render(<Loader />);

        const root = container.firstElementChild;
        expect(root).toHaveClass('app-loader-component');
        expect(root?.querySelector('.loading-section > .loader')).toBeInTheDocument();
    });

    it('keeps the "Loading..." text for assistive tech', () => {
        render(<Loader />);

        expect(screen.getByRole('status')).toHaveTextContent('Loading...');
    });
});
