import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { Loader } from './Loader/Loader';
import { ErrorMessage } from './ErrorMessage/ErrorMessage';

it('renders the shared loading indicator', () => {
  render(<Loader />);
  expect(screen.getByText('Loading...').className).toBe('loader');
});
it('renders the supplied error and offline guidance', () => {
  render(<ErrorMessage message="Unable to load" />);
  expect(screen.getByText('Unable to load')).toBeTruthy();
  expect(screen.getByText(/network connection first/)).toBeTruthy();
});
