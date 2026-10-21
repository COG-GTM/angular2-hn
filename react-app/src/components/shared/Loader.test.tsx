import { render } from '@testing-library/react';

import Loader from './Loader';

describe('Loader', () => {
  it('renders the themed loader markup', () => {
    const { container } = render(<Loader />);
    const loader = container.querySelector('.loading-section > .loader');
    expect(loader).toHaveTextContent('Loading...');
  });
});
