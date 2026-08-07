import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import App from './App';

describe('App', () => {
    it('mounts and renders the themed wrapper', () => {
        const { container } = render(<App />);

        expect(container.querySelector('.wrapper')).toBeInTheDocument();
    });
});
