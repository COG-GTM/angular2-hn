import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
    it('renders the given message with the offline hint', () => {
        const { container } = render(<ErrorMessage message="Could not load news stories." />);

        expect(screen.getByText('Could not load news stories.')).toBeInTheDocument();
        expect(screen.getByText(/If you are offline viewing/)).toBeInTheDocument();
        expect(container.querySelector('.skull')).toBeInTheDocument();
    });
});
