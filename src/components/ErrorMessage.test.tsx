import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
    it('displays the message prop', () => {
        render(<ErrorMessage message="Could not load news stories." />);

        expect(screen.getByText('Could not load news stories.')).toBeInTheDocument();
    });

    it('explains the offline caching behaviour', () => {
        render(<ErrorMessage message="Boom" />);

        expect(screen.getByText(/offline viewing/)).toBeInTheDocument();
    });
});
