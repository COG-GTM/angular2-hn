import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { makeStory } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { Item } from './Item';

describe('Item', () => {
    it('renders an external link with domain, points, author and comment count', () => {
        renderWithProviders(<Item item={makeStory()} />);

        const title = screen.getAllByText('A story')[0];
        expect(title.closest('a')).toHaveAttribute('href', 'https://example.com/post');
        expect(screen.getByText('(example.com)')).toBeInTheDocument();
        expect(screen.getAllByRole('link', { name: 'pg' })[0]).toHaveAttribute('href', '/user/pg');
        expect(screen.getAllByRole('link', { name: /3 comments/ })[0]).toHaveAttribute('href', '/item/1');
    });

    it('links self posts to the item page and shows "discuss" with no comments', () => {
        renderWithProviders(<Item item={makeStory({ url: 'item?id=1', comments_count: 0 })} />);
        expect(screen.getByRole('link', { name: 'A story' })).toHaveAttribute('href', '/item/1');
        expect(screen.getAllByRole('link', { name: /discuss/ }).length).toBeGreaterThan(0);
    });

    it('hides points/author/comments for jobs', () => {
        renderWithProviders(<Item item={makeStory({ type: 'job' })} />);
        expect(screen.queryByRole('link', { name: 'pg' })).not.toBeInTheDocument();
        expect(screen.queryByText(/comments/)).not.toBeInTheDocument();
    });

    it('opens links in a new tab and applies font size from settings', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('titleFontSize', '24');
        renderWithProviders(<Item item={makeStory()} />);
        const link = screen.getByRole('link', { name: 'A story' });
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveStyle({ fontSize: '24px' });
    });
});
