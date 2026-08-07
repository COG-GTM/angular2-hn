import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Item from './Item';
import { Story } from '../../models/story';
import { renderWithProviders, stubMatchMedia } from '../../testUtils';

function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 1,
        title: 'A story',
        points: 42,
        user: 'pg',
        time_ago: '3 hours ago',
        type: 'story',
        url: 'https://example.com/post',
        domain: 'example.com',
        comments_count: 2,
        ...overrides,
    } as unknown as Story;
}

describe('Item', () => {
    beforeEach(() => {
        localStorage.clear();
        stubMatchMedia();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('links externally and shows the domain when the story has a url', () => {
        renderWithProviders(<Item item={makeStory()} />);

        const title = screen.getByRole('link', { name: 'A story' });
        expect(title).toHaveAttribute('href', 'https://example.com/post');
        expect(title).not.toHaveAttribute('target');
        expect(screen.getByText('(example.com)')).toHaveClass('domain');
    });

    it('links to the item details page when the story has no external url', () => {
        renderWithProviders(<Item item={makeStory({ id: 7, url: 'item?id=7', domain: undefined })} />);

        expect(screen.getByRole('link', { name: 'A story' })).toHaveAttribute('href', '/item/7');
        expect(screen.queryByText(/\(.*\)/)).not.toBeInTheDocument();
    });

    it('opens external links in a new tab when the setting is enabled', () => {
        localStorage.setItem('openLinkInNewTab', 'true');

        renderWithProviders(<Item item={makeStory()} />);

        const title = screen.getByRole('link', { name: 'A story' });
        expect(title).toHaveAttribute('target', '_blank');
        expect(title).toHaveAttribute('rel', 'noopener');
    });

    it('applies the title font size and list spacing settings', () => {
        localStorage.setItem('titleFontSize', '22');
        localStorage.setItem('listSpacing', '9');

        const { container } = renderWithProviders(<Item item={makeStory()} />);

        expect(container.querySelector('.item-block')).toHaveStyle({ marginBottom: '9px' });
        expect(screen.getByRole('link', { name: 'A story' })).toHaveStyle({ fontSize: '22px' });
    });

    it('renders points, author and the comment count for stories', () => {
        renderWithProviders(<Item item={makeStory({ comments_count: 2 })} />);

        expect(screen.getAllByRole('link', { name: 'pg' })[0]).toHaveAttribute('href', '/user/pg');
        expect(screen.getByText('42 ★')).toBeInTheDocument();
        expect(screen.getAllByText(/2 comments/)).toHaveLength(2);
    });

    it('renders "discuss" when a story has no comments', () => {
        renderWithProviders(<Item item={makeStory({ comments_count: 0 })} />);

        expect(screen.getAllByText(/discuss/)).toHaveLength(2);
    });

    it('hides points, author and comments for jobs', () => {
        renderWithProviders(<Item item={makeStory({ type: 'job', comments_count: 0 })} />);

        expect(screen.queryByRole('link', { name: 'pg' })).not.toBeInTheDocument();
        expect(screen.queryByText('42 ★')).not.toBeInTheDocument();
        expect(screen.queryByText(/discuss/)).not.toBeInTheDocument();
        expect(screen.getAllByText('3 hours ago')).toHaveLength(2);
    });

    it('navigates to the item details page when the comment link is clicked', async () => {
        const { router } = renderWithProviders(<Item item={makeStory({ id: 99 })} />);

        await userEvent.click(screen.getAllByRole('link', { name: /2 comments/ })[0]);

        expect(router.state.location.pathname).toBe('/item/99');
    });
});
