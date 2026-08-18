import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ErrorMessage } from './ErrorMessage';
import { Loader } from './Loader';

describe('shared components', () => {
    it('renders the loader', () => {
        const { container } = render(<Loader />);
        expect(container.querySelector('.loading-section .loader')).toBeInTheDocument();
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders an error message', () => {
        const { container } = render(<ErrorMessage message="Could not load news stories." />);
        expect(screen.getByText('Could not load news stories.')).toBeInTheDocument();
        expect(container.querySelector('.error-section .skull')).toBeInTheDocument();
    });
});
