import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  it('renders the provided message', () => {
    render(<ErrorMessage message="Could not load news stories." />);
    expect(screen.getByText('Could not load news stories.')).toBeInTheDocument();
  });
});
