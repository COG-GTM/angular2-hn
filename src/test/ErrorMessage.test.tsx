import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorMessage from '../components/ErrorMessage';

describe('ErrorMessage', () => {
    it('renders error message prop', () => {
        render(<ErrorMessage message="Something went wrong" />);
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('renders offline viewing note', () => {
        render(<ErrorMessage message="Error" />);
        expect(screen.getByText(/offline viewing/)).toBeInTheDocument();
    });

    it('renders skull CSS structure', () => {
        const { container } = render(<ErrorMessage message="Error" />);
        expect(container.querySelector('.skull')).toBeInTheDocument();
    });
});
