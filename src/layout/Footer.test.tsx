import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Footer } from './Footer';

describe('Footer', () => {
    it('renders the footer container', () => {
        const { container } = render(<Footer />);
        expect(container.querySelector('#footer')).not.toBeNull();
    });

    it('renders the GitHub link with the correct href and target', () => {
        render(<Footer />);
        const link = screen.getByRole('link', { name: 'GitHub' });
        expect(link).toHaveAttribute('href', 'https://github.com/hdjirdeh/angular2-hn');
        expect(link).toHaveAttribute('target', '_blank');
    });
});
