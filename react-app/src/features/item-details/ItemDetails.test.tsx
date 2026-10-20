import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '../../shared/test-utils';
import { ItemDetails } from './ItemDetails';

// Placeholder test — owned by the Item-details child; replace with real ItemDetails tests.
describe('ItemDetails (placeholder)', () => {
    it('reads :id', () => {
        renderWithProviders(<ItemDetails />, { route: '/item/42', path: '/item/:id' });
        expect(screen.getByTestId('item-details')).toHaveTextContent('item 42');
    });
});
