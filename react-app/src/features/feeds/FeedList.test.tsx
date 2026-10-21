import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '../../shared/test-utils';
import { FeedList } from './FeedList';

// Placeholder test — owned by the Feeds child; replace with real FeedList tests.
describe('FeedList (placeholder)', () => {
    it('reads :page', () => {
        renderWithProviders(<FeedList feedType="show" />, { route: '/show/3', path: '/show/:page' });
        expect(screen.getByTestId('feed-list')).toHaveTextContent('show page 3');
    });
});
