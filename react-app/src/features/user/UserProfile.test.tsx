import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '../../shared/test-utils';
import { UserProfile } from './UserProfile';

// Placeholder test — owned by the User child; replace with real UserProfile tests.
describe('UserProfile (placeholder)', () => {
    it('reads :id', () => {
        renderWithProviders(<UserProfile />, { route: '/user/pg', path: '/user/:id' });
        expect(screen.getByTestId('user-profile')).toHaveTextContent('user pg');
    });
});
