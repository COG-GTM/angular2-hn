import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
    it('renders the passed message', () => {
        render(<ErrorMessage message="Could not load news stories." />);
        expect(screen.getByText('Could not load news stories.')).toBeInTheDocument();
    });

    it('renders the offline hint', () => {
        render(<ErrorMessage message="oops" />);
        expect(screen.getByText(/offline viewing/i)).toBeInTheDocument();
    });
});
