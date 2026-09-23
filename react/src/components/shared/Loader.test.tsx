import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Loader } from './Loader';

describe('Loader', () => {
    it('renders the loading section markup of the Angular loader component', () => {
        const { container } = render(<Loader />);

        const section = container.querySelector('.loading-section');
        expect(section).toBeInTheDocument();
        expect(section?.querySelector('.loader')).toBeInTheDocument();
        expect(screen.getByText('Loading...')).toHaveClass('loader');
    });
});
