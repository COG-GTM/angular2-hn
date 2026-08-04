import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ErrorMessage from './ErrorMessage';
import Loader from './Loader';

describe('shared components', () => {
    it('renders the error message it is given', () => {
        render(<ErrorMessage message="Could not load news stories." />);

        expect(screen.getByText('Could not load news stories.')).toBeInTheDocument();
    });

    it('renders the loader', () => {
        render(<Loader />);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
});
