import { render, screen } from '@testing-library/react';

describe('test harness', () => {
    it('renders react components', () => {
        render(<h1>hello</h1>);
        expect(screen.getByRole('heading', { name: 'hello' })).toBeInTheDocument();
    });
});
