import { render, screen } from '@testing-library/react';

import { Footer } from './Footer';

describe('Footer', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        delete window.ga;
    });

    it('renders the project message and GitHub link', () => {
        render(<Footer />);

        expect(screen.getByText(/Show this project some ❤ on/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
            'href',
            'https://github.com/hdjirdeh/angular2-hn'
        );
        expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('target', '_blank');
        expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('rel', 'noopener');
    });
});
