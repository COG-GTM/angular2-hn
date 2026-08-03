import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Footer } from './Footer';

describe('Footer', () => {
    it('links to the project on GitHub in a new tab', () => {
        render(<Footer />);

        const link = screen.getByRole('link', { name: 'GitHub' });
        expect(link).toHaveAttribute('href', 'https://github.com/hdjirdeh/angular2-hn');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    });
});
