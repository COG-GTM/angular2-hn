import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Loader } from './Loader';

describe('Loader', () => {
  it('renders a loading indicator', () => {
    render(<Loader />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
