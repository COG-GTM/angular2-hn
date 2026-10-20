import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '../../shared/test-utils';
import { Header } from './Header';

// Placeholder test — owned by the Shell child; replace with real Header tests.
describe('Header (placeholder)', () => {
    it('renders', () => {
        renderWithProviders(<Header />);
        expect(screen.getByTestId('header')).toBeInTheDocument();
    });
});
