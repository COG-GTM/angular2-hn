import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '../../shared/test-utils';
import { Footer } from './Footer';

// Placeholder test — owned by the Shell child; replace with real Footer tests.
describe('Footer (placeholder)', () => {
    it('renders', () => {
        renderWithProviders(<Footer />);
        expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
});
