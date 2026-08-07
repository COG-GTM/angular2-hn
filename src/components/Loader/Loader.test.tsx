import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Loader from './Loader';

describe('Loader', () => {
    it('renders the loading section', () => {
        const { container } = render(<Loader />);

        expect(container.querySelector('.loading-section')).toBeInTheDocument();
        expect(screen.getByText('Loading...')).toHaveClass('loader');
    });
});
