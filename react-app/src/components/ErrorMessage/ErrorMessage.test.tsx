import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  it('renders the error message', () => {
    render(<ErrorMessage message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeTruthy();
  });

  it('shows offline hint', () => {
    render(<ErrorMessage message="Test" />);
    expect(screen.getByText(/offline viewing/)).toBeTruthy();
  });
});
