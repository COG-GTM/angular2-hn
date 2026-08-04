import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Story } from '../../models';
import { renderWithProviders } from '../../test-utils';
import Item from './Item';

function buildStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 1,
        title: 'A story',
        points: 10,
        user: 'pg',
        time: 0,
        time_ago: '1 hour ago',
        type: 'story',
        url: 'https://example.com/story',
        domain: 'example.com',
        content: '',
        comments: [],
        comments_count: 2,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
        ...overrides,
    };
}

describe('Item', () => {
    it('links externally when the story has an absolute url', () => {
        renderWithProviders(<Item item={buildStory()} />);

        expect(screen.getByRole('link', { name: 'A story' })).toHaveAttribute(
            'href',
            'https://example.com/story'
        );
        expect(screen.getByText('(example.com)')).toBeInTheDocument();
    });

    it('links to the item details route when the story has no absolute url', () => {
        renderWithProviders(<Item item={buildStory({ url: 'item?id=1', domain: '' })} />);

        expect(screen.getByRole('link', { name: 'A story' })).toHaveAttribute('href', '/item/1');
    });

    it('renders the comment count and author for stories', () => {
        renderWithProviders(<Item item={buildStory()} />);

        expect(screen.getAllByRole('link', { name: '2 comments' }).length).toBeGreaterThan(0);
        expect(screen.getAllByRole('link', { name: 'pg' })[0]).toHaveAttribute('href', '/user/pg');
    });

    it('hides author, points and comments for jobs', () => {
        renderWithProviders(<Item item={buildStory({ type: 'job' })} />);

        expect(screen.queryByText('pg')).not.toBeInTheDocument();
        expect(screen.queryByText('2 comments')).not.toBeInTheDocument();
    });
});
