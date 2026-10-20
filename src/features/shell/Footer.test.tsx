import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '../../shared/test-utils';
import { Footer } from './Footer';

describe('Footer', () => {
    it('renders the Angular footer text and GitHub link opening in a new tab', () => {
        const { container } = renderWithProviders(<Footer />);
        const footer = container.querySelector('#footer');
        expect(footer).toHaveAttribute('data-testid', 'footer');
        expect(footer).toHaveTextContent('Show this project some ❤ on GitHub');
        const link = screen.getByRole('link', { name: 'GitHub' });
        expect(link).toHaveAttribute('href', 'https://github.com/hdjirdeh/angular2-hn');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    });
});
