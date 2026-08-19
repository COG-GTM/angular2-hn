import { describe, expect, it } from 'vitest';

import Footer from './Footer';
import { renderWithProviders, screen } from '../test/renderWithProviders';

describe('Footer', () => {
    it('renders a link to the project repository', () => {
        renderWithProviders(<Footer />);

        const link = screen.getByRole('link', { name: 'GitHub' });
        expect(link).toHaveAttribute('href', 'https://github.com/hdjirdeh/angular2-hn');
        expect(link).toHaveAttribute('target', '_blank');
        expect(screen.getByText(/Show this project some/)).toBeInTheDocument();
    });
});
