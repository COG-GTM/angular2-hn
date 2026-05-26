import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, it, expect } from 'vitest';
import { Loader } from '../Loader';

describe('Loader', () => {
  it('renders the loader container', () => {
    const { container } = render(<Loader />);
    const loaderContainer = container.querySelector('.loaderContainer');
    expect(loaderContainer).toBeInTheDocument();
  });

  it('renders the spinner element', () => {
    const { container } = render(<Loader />);
    const spinner = container.querySelector('.loader');
    expect(spinner).toBeInTheDocument();
  });

  it('passes accessibility checks', async () => {
    const { container } = render(<Loader />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
