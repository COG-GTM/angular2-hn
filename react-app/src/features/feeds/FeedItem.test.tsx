import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { Story } from '../../shared/models';
import { renderWithProviders } from '../../shared/test-utils';
import { FeedItem } from './FeedItem';

// Placeholder test — owned by the Feeds child; replace with real FeedItem tests.
describe('FeedItem (placeholder)', () => {
    it('takes an item', () => {
        renderWithProviders(<FeedItem item={{ id: 1, title: 'Hello' } as Story} />);
        expect(screen.getByTestId('feed-item')).toHaveTextContent('Hello');
    });
});
