import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { Story } from '../../shared/models';
import { renderWithProviders } from '../../shared/test-utils';
import { FeedItem, FeedList } from './index';

describe('feeds placeholders', () => {
    it('FeedList shows the feed type and :page param', () => {
        renderWithProviders(<FeedList feedType="show" />, { route: '/show/3', path: '/show/:page' });
        expect(screen.getByTestId('feed-type')).toHaveTextContent('show');
        expect(screen.getByTestId('feed-page')).toHaveTextContent('3');
    });

    it('FeedItem renders the story title', () => {
        const item = { id: 1, title: 'Hello HN' } as Story;
        renderWithProviders(<FeedItem item={item} />);
        expect(screen.getByTestId('feed-item-placeholder')).toHaveTextContent('Hello HN');
    });
});
