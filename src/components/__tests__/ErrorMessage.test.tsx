import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, it, expect } from 'vitest';
import { ErrorMessage } from '../ErrorMessage';

describe('ErrorMessage', () => {
  it('renders the provided error message', () => {
    render(<ErrorMessage message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders within an error section container', () => {
    const { container } = render(<ErrorMessage message="Network error" />);
    const errorSection = container.querySelector('.errorSection');
    expect(errorSection).toBeInTheDocument();
  });

  it('renders different messages correctly', () => {
    const { rerender } = render(<ErrorMessage message="Error 1" />);
    expect(screen.getByText('Error 1')).toBeInTheDocument();

    rerender(<ErrorMessage message="Error 2" />);
    expect(screen.getByText('Error 2')).toBeInTheDocument();
    expect(screen.queryByText('Error 1')).not.toBeInTheDocument();
  });

  it('passes accessibility checks', async () => {
    const { container } = render(<ErrorMessage message="Test error" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
