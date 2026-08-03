import { screen } from '@testing-library/react';

import Item from './Item';
import { makeStory } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';

describe('Item', () => {
    it('links an external story to its url and shows the domain', () => {
        renderWithProviders(<Item item={makeStory()} />);

        const title = screen.getByRole('link', { name: 'A linked story' });

        expect(title).toHaveAttribute('href', 'https://example.com/post');
        expect(title).not.toHaveAttribute('target');
        expect(screen.getByText('(example.com)')).toBeInTheDocument();
    });

    it('links a self post to its discussion page', () => {
        renderWithProviders(<Item item={makeStory({ url: 'item?id=100', title: 'Ask HN: anything?' })} />);

        expect(screen.getByRole('link', { name: 'Ask HN: anything?' })).toHaveAttribute('href', '/item/100');
    });

    it('opens external links in a new tab when the setting is on', () => {
        localStorage.setItem('openLinkInNewTab', 'true');

        renderWithProviders(<Item item={makeStory()} />);

        const title = screen.getByRole('link', { name: 'A linked story' });

        expect(title).toHaveAttribute('target', '_blank');
        expect(title).toHaveAttribute('rel', 'noopener');
    });

    it('applies the title font size and list spacing settings', () => {
        localStorage.setItem('titleFontSize', '24');
        localStorage.setItem('listSpacing', '12');

        const { container } = renderWithProviders(<Item item={makeStory()} />);

        expect(screen.getByRole('link', { name: 'A linked story' })).toHaveStyle({ fontSize: '24px' });
        expect(container.querySelector('.item-block > div')).toHaveStyle({ marginBottom: '12px' });
    });

    it('shows points, author, age and the comment count', () => {
        renderWithProviders(<Item item={makeStory()} />);

        expect(screen.getAllByRole('link', { name: 'pg' })[0]).toHaveAttribute('href', '/user/pg');
        expect(screen.getByText('42 ★')).toBeInTheDocument();
        expect(screen.getAllByText(/2 hours ago/)[0]).toBeInTheDocument();
        expect(screen.getAllByRole('link', { name: /3 comments/ })[0]).toHaveAttribute('href', '/item/100');
    });

    it('says "discuss" when a story has no comments', () => {
        renderWithProviders(<Item item={makeStory({ comments_count: 0 })} />);

        expect(screen.getAllByRole('link', { name: /discuss/ })).not.toHaveLength(0);
    });

    it('hides author, points and comments for job postings', () => {
        renderWithProviders(<Item item={makeStory({ type: 'job', title: 'YC startup is hiring' })} />);

        expect(screen.queryByText('42 ★')).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'pg' })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /comments/ })).not.toBeInTheDocument();
        expect(screen.getAllByText(/2 hours ago/)[0]).toBeInTheDocument();
    });
});
