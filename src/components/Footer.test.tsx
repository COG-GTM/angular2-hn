import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer', () => {
    it('renders the GitHub link opening in a new tab', () => {
        render(<Footer />);

        const link = screen.getByRole('link', { name: 'GitHub' });
        expect(link.getAttribute('href')).toBe('https://github.com/hdjirdeh/angular2-hn');
        expect(link.getAttribute('target')).toBe('_blank');
        expect(link.getAttribute('rel')).toBe('noopener');
    });
});
