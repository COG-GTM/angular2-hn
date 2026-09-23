import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Footer } from './Footer';

describe('Footer', () => {
    it('renders the footer markup of the Angular footer component', () => {
        const { container } = render(<Footer />);

        const footer = container.querySelector('#footer');
        expect(footer).toBeInTheDocument();
        expect(footer?.querySelector('p')).toHaveTextContent('Show this project some ❤ on GitHub');
    });

    it('links to the project repository in a new tab', () => {
        render(<Footer />);

        const link = screen.getByRole('link', { name: 'GitHub' });
        expect(link).toHaveAttribute('href', 'https://github.com/hdjirdeh/angular2-hn');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener');
    });
});
