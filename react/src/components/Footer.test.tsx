// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Footer from './Footer';

describe('Footer', () => {
    it('renders the GitHub link opening in a new tab', () => {
        render(<Footer />);
        const link = screen.getByText('GitHub');
        expect(link.getAttribute('href')).toBe('https://github.com/hdjirdeh/angular2-hn');
        expect(link.getAttribute('target')).toBe('_blank');
        expect(link.getAttribute('rel')).toContain('noopener');
    });
});
