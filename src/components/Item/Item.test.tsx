import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { makeStory } from '../../test/fixtures';
import { renderWithProviders } from '../../test/renderWithProviders';
import { Item } from './Item';

describe('Item', () => {
    it('links externally when the story has a url and shows the domain', () => {
        renderWithProviders(<Item item={makeStory()} />);

        const title = screen.getByRole('link', { name: 'A linked story' });
        expect(title).toHaveAttribute('href', 'https://example.com/story');
        expect(title).not.toHaveAttribute('target');
        expect(screen.getByText('(example.com)')).toBeInTheDocument();
    });

    it('links to the item page for self posts', () => {
        renderWithProviders(<Item item={makeStory({ id: 5, url: 'item?id=5', domain: undefined })} />);

        expect(screen.getByRole('link', { name: 'A linked story' })).toHaveAttribute('href', '/item/5');
        expect(screen.queryByText(/\(/)).not.toBeInTheDocument();
    });

    it('opens external links in a new tab when the setting is enabled', () => {
        localStorage.setItem('openLinkInNewTab', 'true');

        renderWithProviders(<Item item={makeStory()} />);

        const title = screen.getByRole('link', { name: 'A linked story' });
        expect(title).toHaveAttribute('target', '_blank');
        expect(title).toHaveAttribute('rel', 'noopener');
    });

    it('renders points, author and comment count for stories', () => {
        renderWithProviders(<Item item={makeStory({ comments_count: 1 })} />);

        expect(screen.getAllByRole('link', { name: 'alice' })[0]).toHaveAttribute('href', '/user/alice');
        expect(screen.getByText('42 ★')).toBeInTheDocument();
        expect(screen.getAllByText(/1 comment/)).toHaveLength(2);
        expect(screen.getAllByText(/2 hours ago/)).toHaveLength(2);
    });

    it('shows "discuss" when a story has no comments', () => {
        renderWithProviders(<Item item={makeStory({ comments_count: 0 })} />);

        expect(screen.getAllByText(/discuss/)).toHaveLength(2);
    });

    it('hides author, points and comments for job posts', () => {
        renderWithProviders(<Item item={makeStory({ type: 'job', user: null, points: null })} />);

        expect(screen.queryByRole('link', { name: 'alice' })).not.toBeInTheDocument();
        expect(screen.queryByText(/points by/)).not.toBeInTheDocument();
        expect(screen.queryByText(/comments/)).not.toBeInTheDocument();
    });

    it('applies the configured font size and list spacing', async () => {
        localStorage.setItem('titleFontSize', '24');
        localStorage.setItem('listSpacing', '10');

        renderWithProviders(<Item item={makeStory()} />);

        expect(screen.getByRole('link', { name: 'A linked story' })).toHaveStyle({ fontSize: '24px' });
        expect(screen.getByRole('link', { name: 'A linked story' }).closest('div')).toHaveStyle({
            marginBottom: '10px',
        });
        await userEvent.click(screen.getAllByRole('link', { name: 'alice' })[0]);
    });
});
