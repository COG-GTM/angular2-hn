import { render, screen } from '@testing-library/react';

import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
    it('renders the skull graphic, the message and the offline note', () => {
        const { container } = render(<ErrorMessage message="Could not load news stories." />);
        expect(container.querySelector('.error-section .skull .head .crack')).not.toBeNull();
        expect(container.querySelector('.error-section .skull .mouth .teeth')).not.toBeNull();
        expect(screen.getByText('Could not load news stories.')).toHaveClass('strong');
        expect(screen.getByText(/If you are offline viewing/)).toBeInTheDocument();
    });
});
