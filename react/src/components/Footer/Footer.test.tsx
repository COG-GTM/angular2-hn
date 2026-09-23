import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Footer } from './Footer';

describe('Footer', () => {
    it('renders the Angular footer markup: a #footer wrapper with a single paragraph', () => {
        const { container } = render(<Footer />);

        const footer = container.querySelector('#footer');
        expect(footer).not.toBeNull();
        expect(footer?.querySelectorAll('p')).toHaveLength(1);
        expect(footer?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
            'Show this project some ❤ on GitHub'
        );
    });

    it('links to the project repository in a new tab with rel="noopener"', () => {
        render(<Footer />);

        const link = screen.getByRole('link', { name: 'GitHub' });
        expect(link).toHaveAttribute('href', 'https://github.com/hdjirdeh/angular2-hn');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener');
    });
});
