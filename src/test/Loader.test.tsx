import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Loader from '../components/shared/Loader';

describe('Loader', () => {
  it('renders loading text', () => {
    render(<Loader />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
