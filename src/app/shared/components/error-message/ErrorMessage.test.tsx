import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  it('renders the given message alongside the offline hint', () => {
    render(<ErrorMessage message="Could not load news stories." />);

    expect(screen.getByText('Could not load news stories.')).toBeInTheDocument();
    expect(screen.getByText(/offline viewing/)).toBeInTheDocument();
  });
});
