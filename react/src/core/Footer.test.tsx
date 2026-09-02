import { render, screen } from '@testing-library/react';

import { Footer } from './Footer';

describe('Footer', () => {
    it('renders the GitHub link inside #footer', () => {
        const { container } = render(<Footer />);
        expect(container.querySelector('#footer p')).toHaveTextContent('Show this project some ❤ on GitHub');
        const link = screen.getByRole('link', { name: 'GitHub' });
        expect(link).toHaveAttribute('href', 'https://github.com/hdjirdeh/angular2-hn');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener');
    });
});
