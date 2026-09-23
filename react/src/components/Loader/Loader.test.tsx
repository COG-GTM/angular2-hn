import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Loader } from './Loader';

describe('Loader', () => {
    it('renders the same markup as the Angular loader template', () => {
        const { container } = render(<Loader />);

        const section = container.querySelector('.loading-section');
        expect(section).not.toBeNull();
        expect(section?.children).toHaveLength(1);

        const loader = section?.firstElementChild;
        expect(loader).toHaveClass('loader');
        expect(loader?.textContent).toBe('Loading...');
        expect(screen.getByText('Loading...')).toBe(loader);
    });

    it('renders statically, without inputs or state', () => {
        const first = render(<Loader />).container.innerHTML;
        const second = render(<Loader />).container.innerHTML;
        expect(second).toBe(first);
    });
});
