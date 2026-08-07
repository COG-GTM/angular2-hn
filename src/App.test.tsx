import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';

describe('App', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.stubGlobal(
            'matchMedia',
            vi.fn(() => ({
                matches: false,
                media: '(prefers-color-scheme: dark)',
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            }))
        );
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('mounts and renders the themed shell', () => {
        const { container } = render(<App />);

        expect(container.querySelector('.wrapper')).toBeInTheDocument();
        expect(screen.getByAltText('Logo')).toBeInTheDocument();
    });
});
