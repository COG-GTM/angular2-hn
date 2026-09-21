import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import App from './App';

describe('App', () => {
    it('renders the themed app shell', () => {
        const { container } = render(<App />);

        expect(container.querySelector('.default')).toBeInTheDocument();
        expect(container.querySelector('.body-cover')).toBeInTheDocument();
        expect(container.querySelector('.wrapper')).toBeInTheDocument();
    });
});
