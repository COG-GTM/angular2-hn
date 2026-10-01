import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ErrorMessage } from './ErrorMessage';
import { Loader } from './Loader';

describe('Loader', () => {
  it('renders an accessible loading indicator', () => {
    render(<Loader />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading...');
  });
});

describe('ErrorMessage', () => {
  it('renders the message and offline hint as an alert', () => {
    render(<ErrorMessage message="Could not load stories." />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Could not load stories.');
    expect(alert).toHaveTextContent(/offline viewing/);
  });
});
