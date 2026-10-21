import { render, screen } from '@testing-library/react';

import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
  it('renders the skull, the message and the offline hint', () => {
    const { container } = render(<ErrorMessage message="Could not load item" />);
    expect(container.querySelector('.error-section .skull .head .crack')).toBeInTheDocument();
    expect(container.querySelector('.error-section .skull .mouth .teeth')).toBeInTheDocument();
    expect(screen.getByText('Could not load item')).toHaveClass('strong');
    expect(screen.getByText(/visit this page with a network connection first/)).toBeInTheDocument();
  });
});
