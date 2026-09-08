import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
    it('renders the provided message', () => {
        render(<ErrorMessage message="Something went wrong" />);

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
});
