import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Loader } from './Loader';

describe('Loader', () => {
  it('renders the spinner', () => {
    const { container } = render(<Loader />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(container.querySelector('.loader-view.loading-section')).not.toBeNull();
  });
});
