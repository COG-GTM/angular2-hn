import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ErrorMessage, Loader } from './index';

describe('shared components', () => {
    it('Loader renders the Angular markup', () => {
        const { container } = render(<Loader />);
        expect(container.querySelector('.loading-section .loader')).toHaveTextContent('Loading...');
    });

    it('ErrorMessage renders the message', () => {
        const { container } = render(<ErrorMessage message="Could not load user" />);
        expect(screen.getByText('Could not load user')).toHaveClass('strong');
        expect(container.querySelector('.error-section .skull .head .crack')).toBeInTheDocument();
    });
});
