import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
    it('renders the given message and the offline hint', () => {
        render(<ErrorMessage message="Could not load news stories." />);

        expect(screen.getByText('Could not load news stories.')).toBeInTheDocument();
        expect(screen.getByText(/you'll need to visit this page with a network connection/i)).toBeInTheDocument();
    });
});
