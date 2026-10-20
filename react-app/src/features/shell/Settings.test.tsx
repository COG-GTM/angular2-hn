import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '../../shared/test-utils';
import { Settings } from './Settings';

// Placeholder test — owned by the Shell child; replace with real Settings tests.
describe('Settings (placeholder)', () => {
    it('renders', () => {
        renderWithProviders(<Settings />);
        expect(screen.getByTestId('settings')).toBeInTheDocument();
    });
});
