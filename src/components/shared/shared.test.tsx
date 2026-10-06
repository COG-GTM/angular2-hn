import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ErrorMessage, Loader } from '.';

describe('shared components', () => {
    it('renders the loader', () => {
        render(<Loader />);
        expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    });

    it('renders the error message with offline hint', () => {
        render(<ErrorMessage message="Could not load news stories." />);
        expect(screen.getByRole('alert')).toHaveTextContent('Could not load news stories.');
        expect(screen.getByRole('alert')).toHaveTextContent('offline');
    });
});
