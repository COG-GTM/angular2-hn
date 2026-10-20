import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '../../shared/test-utils';
import { UserProfile } from './index';

describe('user placeholder', () => {
    it('UserProfile shows the :id param', () => {
        renderWithProviders(<UserProfile />, { route: '/user/pg', path: '/user/:id' });
        expect(screen.getByTestId('user-id')).toHaveTextContent('pg');
    });
});
