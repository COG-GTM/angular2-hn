import { render, screen } from '@testing-library/react';

import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
    it('renders the message passed in as the bold paragraph', () => {
        render(<ErrorMessage message="Could not load page" />);

        const strong = screen.getByText('Could not load page');
        expect(strong.tagName).toBe('P');
        expect(strong).toHaveClass('strong');
    });

    it('renders the offline hint below the message', () => {
        render(<ErrorMessage message="Oops" />);

        expect(screen.getByRole('alert')).toHaveTextContent(
            "If you are offline viewing, you'll need to visit this page with a network connection first before it can work offline."
        );
    });

    it('renders the CSS skull with the same structure/class names as the Angular template', () => {
        const { container } = render(<ErrorMessage message="Oops" />);

        const root = container.firstElementChild;
        expect(root).toHaveClass('app-error-message');
        expect(root?.querySelector('.error-section > .skull > .head > .crack')).toBeInTheDocument();
        expect(root?.querySelector('.error-section > .skull > .mouth > .teeth')).toBeInTheDocument();
        expect(root?.querySelector('.skull')).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders an empty bold paragraph when the message is empty (no default text, like the Angular @Input)', () => {
        const { container } = render(<ErrorMessage message="" />);

        expect(container.querySelector('p.strong')).toHaveTextContent('');
    });
});
