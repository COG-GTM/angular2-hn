import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { makeStory } from '../../test/fixtures';
import { renderWithProviders } from '../../test/renderWithProviders';
import FeedItem from './FeedItem';

describe('FeedItem', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('links the title to the story url and shows its domain', () => {
        renderWithProviders(<FeedItem item={makeStory()} />);

        const title = screen.getByRole('link', { name: /My YC app/ });
        expect(title).toHaveAttribute('href', 'http://www.getdropbox.com/u/2/screencast.html');
        expect(title).not.toHaveAttribute('target');
        expect(screen.getByText('(getdropbox.com)')).toBeInTheDocument();
    });

    it('opens external links in a new tab when the setting is enabled', () => {
        localStorage.setItem('openLinkInNewTab', 'true');

        renderWithProviders(<FeedItem item={makeStory()} />);

        const title = screen.getByRole('link', { name: /My YC app/ });
        expect(title).toHaveAttribute('target', '_blank');
        expect(title).toHaveAttribute('rel', 'noopener');
    });

    it('links the title to the item page for stories without a url', () => {
        renderWithProviders(<FeedItem item={makeStory({ url: 'item?id=8863', title: 'Ask HN: anything?' })} />);

        expect(screen.getByRole('link', { name: 'Ask HN: anything?' })).toHaveAttribute('href', '/item/8863');
    });

    it('renders points, author and comment count', () => {
        renderWithProviders(<FeedItem item={makeStory()} />);

        expect(screen.getAllByRole('link', { name: 'dhouston' })[0]).toHaveAttribute('href', '/user/dhouston');
        expect(screen.getAllByRole('link', { name: /71 comments/ })[0]).toHaveAttribute('href', '/item/8863');
        expect(screen.getByText('111 ★')).toBeInTheDocument();
    });

    it('renders "discuss" when a story has no comments', () => {
        renderWithProviders(<FeedItem item={makeStory({ comments_count: 0 })} />);

        expect(screen.getAllByRole('link', { name: /discuss/ })).not.toHaveLength(0);
    });

    it('hides author, points and comments for jobs', () => {
        renderWithProviders(<FeedItem item={makeStory({ type: 'job', comments_count: 0 })} />);

        expect(screen.queryByRole('link', { name: 'dhouston' })).not.toBeInTheDocument();
        expect(screen.queryByText(/111/)).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /discuss/ })).not.toBeInTheDocument();
    });

    it('applies the title font size and list spacing settings', () => {
        localStorage.setItem('titleFontSize', '22');
        localStorage.setItem('listSpacing', '7');

        const { container } = renderWithProviders(<FeedItem item={makeStory()} />);

        expect(screen.getByRole('link', { name: /My YC app/ })).toHaveStyle({ fontSize: '22px' });
        expect(container.firstElementChild).toHaveStyle({ marginBottom: '7px' });
    });
});
