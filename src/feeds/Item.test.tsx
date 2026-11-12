import { screen } from '@testing-library/react';

import { makeStory } from '../test/fixtures';
import { renderWithProviders } from '../test/utils';
import { Item } from './Item';

describe('Item', () => {
    it('renders an external story with domain, author and comment count', () => {
        renderWithProviders(<Item item={makeStory()} />);
        const title = screen.getByRole('link', { name: 'A story' });
        expect(title).toHaveAttribute('href', 'https://example.com/a');
        expect(title).not.toHaveAttribute('target');
        expect(screen.getAllByText('(example.com)')).toHaveLength(1);
        expect(screen.getAllByRole('link', { name: 'pg' })[0]).toHaveAttribute('href', '/user/pg');
        expect(screen.getAllByRole('link', { name: /3 comments/ })[0]).toHaveAttribute('href', '/item/1');
    });

    it('links internal stories (e.g. Ask HN) to the item page', () => {
        renderWithProviders(<Item item={makeStory({ url: 'item?id=1', domain: undefined })} />);
        expect(screen.getByRole('link', { name: 'A story' })).toHaveAttribute('href', '/item/1');
    });

    it('hides author, points and comments for jobs', () => {
        renderWithProviders(<Item item={makeStory({ type: 'job' })} />);
        expect(screen.queryByRole('link', { name: 'pg' })).not.toBeInTheDocument();
        expect(screen.queryByText(/points/)).not.toBeInTheDocument();
    });

    it('applies the user display settings', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('titleFontSize', '22');
        renderWithProviders(<Item item={makeStory()} />);
        const title = screen.getByRole('link', { name: 'A story' });
        expect(title).toHaveAttribute('target', '_blank');
        expect(title).toHaveAttribute('rel', 'noopener');
        expect(title).toHaveStyle({ fontSize: '22px' });
    });
});
