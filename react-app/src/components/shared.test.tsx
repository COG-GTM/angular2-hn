import { render, screen } from '@testing-library/react';

import { ErrorMessage } from './ErrorMessage/ErrorMessage';
import { Loader } from './Loader/Loader';

describe('shared components', () => {
  it('Loader renders a loading indicator', () => {
    render(<Loader />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading...');
  });

  it('ErrorMessage renders the message and the offline hint', () => {
    render(<ErrorMessage message="Could not load news stories." />);
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load news stories.');
    expect(screen.getByText(/visit this page with a network connection first/)).toBeInTheDocument();
  });
});
