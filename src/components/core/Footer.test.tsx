import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer', () => {
    it('links to the project repository', () => {
        render(<Footer />);

        expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
            'href',
            'https://github.com/hdjirdeh/angular2-hn'
        );
    });
});
