import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { Item } from './Item';
import type { Story } from '../models';
import { useSettings } from '../context/useSettings';
import { renderWithProviders, mockMatchMedia } from '../test/utils';

function NewTabToggle() {
    const { toggleOpenLinksInNewTab } = useSettings();
    return <button onClick={toggleOpenLinksInNewTab}>new-tab</button>;
}

function story(overrides: Partial<Story> = {}): Story {
    return {
        id: 42,
        title: 'A React story',
        points: 120,
        user: 'dang',
        time: 1600000000,
        time_ago: '3 hours ago' as unknown as number,
        type: 'story',
        url: 'https://example.com/post',
        domain: 'example.com',
        comments: [],
        comments_count: 5,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
        ...overrides,
    };
}

beforeEach(() => {
    localStorage.clear();
    mockMatchMedia(false);
});

describe('Item', () => {
    it('renders an external title link with the domain', () => {
        renderWithProviders(<Item item={story()} />);

        const title = screen.getByRole('link', { name: 'A React story' });
        expect(title).toHaveAttribute('href', 'https://example.com/post');
        expect(title).not.toHaveAttribute('target');
        expect(screen.getByText('(example.com)')).toBeInTheDocument();
    });

    it('opens external links in a new tab when the setting is enabled', async () => {
        renderWithProviders(
            <>
                <NewTabToggle />
                <Item item={story()} />
            </>
        );

        await userEvent.click(screen.getByRole('button', { name: 'new-tab' }));

        const title = screen.getByRole('link', { name: 'A React story' });
        expect(title).toHaveAttribute('target', '_blank');
        expect(title).toHaveAttribute('rel', 'noopener');
    });

    it('links internally when the item has no external url', () => {
        renderWithProviders(<Item item={story({ url: 'item?id=42', domain: '' })} />);

        expect(screen.getByRole('link', { name: 'A React story' })).toHaveAttribute('href', '/item/42');
        expect(screen.queryByText(/\(/)).not.toBeInTheDocument();
    });

    it('renders points, user and comment count in both layouts', () => {
        const { container } = renderWithProviders(<Item item={story()} />);

        expect(screen.getAllByRole('link', { name: 'dang' })).toHaveLength(2);
        expect(screen.getAllByRole('link', { name: 'dang' })[0]).toHaveAttribute('href', '/user/dang');
        expect(screen.getByText('120 ★')).toBeInTheDocument();
        expect(container.querySelector('.subtext-laptop')).toHaveTextContent('120 points by dang');
        expect(container.querySelector('.comment-number')).toHaveTextContent('• 5 comments');
        expect(container.querySelector('.subtext-laptop')).toHaveTextContent('| 5 comments');
    });

    it('renders "discuss" when there are no comments', () => {
        const { container } = renderWithProviders(<Item item={story({ comments_count: 0 })} />);

        expect(container.querySelector('.comment-number')).toHaveTextContent('discuss');
        expect(container.querySelector('.subtext-laptop')).toHaveTextContent('discuss');
    });

    it('renders "1 comment" for a single comment', () => {
        const { container } = renderWithProviders(<Item item={story({ comments_count: 1 })} />);

        expect(container.querySelector('.comment-number')).toHaveTextContent('1 comment');
        expect(container.querySelector('.subtext-laptop')).toHaveTextContent('1 comment');
    });

    it('hides points, user and comments for job items', () => {
        const { container } = renderWithProviders(<Item item={story({ type: 'job', comments_count: 0 })} />);

        expect(screen.queryByRole('link', { name: 'dang' })).not.toBeInTheDocument();
        expect(screen.queryByText('discuss')).not.toBeInTheDocument();
        expect(container.querySelector('.item-details')).not.toBeInTheDocument();
        expect(container.querySelector('.subtext-palm')).toHaveTextContent('3 hours ago');
    });

    it('applies the title font size and list spacing settings', () => {
        const { container } = renderWithProviders(<Item item={story()} />);

        expect(container.querySelector('.title')).toHaveStyle({ fontSize: '16px' });
        expect(container.firstElementChild).toHaveStyle({ marginBottom: '0px' });
    });
});
