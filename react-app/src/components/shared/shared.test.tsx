import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ErrorMessage } from './ErrorMessage';
import { Loader } from './Loader';

describe('shared components', () => {
    it('renders the loading indicator', () => {
        render(<Loader />);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders the error message with offline guidance', () => {
        render(<ErrorMessage message="Could not load news stories." />);

        expect(screen.getByText('Could not load news stories.')).toBeInTheDocument();
        expect(screen.getByText(/offline viewing/)).toBeInTheDocument();
    });
});
