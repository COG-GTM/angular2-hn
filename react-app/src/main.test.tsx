import { render, screen } from '@testing-library/react';

describe('test harness', () => {
  it('renders with jsdom and jest-dom matchers', () => {
    render(<p>ok</p>);
    expect(screen.getByText('ok')).toBeInTheDocument();
  });
});
