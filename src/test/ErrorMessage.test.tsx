import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorMessage from '../components/shared/ErrorMessage';

describe('ErrorMessage', () => {
  it('renders the error message', () => {
    render(<ErrorMessage message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders the offline notice', () => {
    render(<ErrorMessage message="Error" />);
    expect(screen.getByText(/offline viewing/i)).toBeInTheDocument();
  });
});
