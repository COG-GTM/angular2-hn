import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { ErrorMessage } from './ErrorMessage/ErrorMessage';
import { Loader } from './Loader/Loader';

it('renders the loader', () => {
    render(<Loader />);
    expect(screen.getByText('Loading...')).toHaveClass('loader');
});

it('renders the error message', () => {
    render(<ErrorMessage message="Could not load news stories." />);
    expect(screen.getByText('Could not load news stories.')).toHaveClass('strong');
    expect(screen.getByText(/offline viewing/)).toBeInTheDocument();
});
