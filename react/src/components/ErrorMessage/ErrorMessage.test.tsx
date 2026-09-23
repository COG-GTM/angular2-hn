import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ErrorMessage } from './ErrorMessage';

const OFFLINE_COPY =
    "If you are offline viewing, you'll need to visit this page with a network connection first before it can work offline.";

describe('ErrorMessage', () => {
    it('renders the message in the strong paragraph', () => {
        render(<ErrorMessage message="Could not load news stories." />);

        const message = screen.getByText('Could not load news stories.');
        expect(message.tagName).toBe('P');
        expect(message).toHaveClass('strong');
    });

    it('always renders the offline hint paragraph', () => {
        render(<ErrorMessage message="Could not load item comments." />);

        const hint = screen.getByText(OFFLINE_COPY);
        expect(hint.tagName).toBe('P');
        expect(hint).not.toHaveClass('strong');
    });

    it('renders the skull markup with the Angular class names', () => {
        const { container } = render(<ErrorMessage message="Could not load user foo." />);

        expect(container.querySelector('.error-section')).toBeInTheDocument();
        expect(container.querySelector('.error-section > .skull > .head > .crack')).toBeInTheDocument();
        expect(container.querySelector('.error-section > .skull > .mouth > .teeth')).toBeInTheDocument();
    });

    it('renders an empty strong paragraph when no message is bound', () => {
        const { container } = render(<ErrorMessage />);

        const strong = container.querySelector('p.strong');
        expect(strong).toBeInTheDocument();
        expect(strong).toBeEmptyDOMElement();
    });
});
