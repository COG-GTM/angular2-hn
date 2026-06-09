import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
    it('renders the provided message', () => {
        render(<ErrorMessage message="Could not load news stories." />);
        expect(
            screen.getByText('Could not load news stories.')
        ).toBeInTheDocument();
    });
});
