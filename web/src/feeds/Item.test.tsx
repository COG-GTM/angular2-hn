import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Item } from './Item';
import { SettingsProvider } from '../context/SettingsContext';
import { Story } from '../models/story';
import { stubMatchMedia } from '../testUtils/matchMedia';

function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 1,
        title: 'A React story',
        points: 42,
        user: 'dan',
        time: 1600000000,
        time_ago: '2 hours ago',
        type: 'story',
        url: 'https://example.com/story',
        domain: 'example.com',
        comments_count: 3,
        ...overrides,
    };
}

function renderItem(story: Story) {
    stubMatchMedia(false);

    return render(
        <MemoryRouter>
            <SettingsProvider>
                <Item className="item-block" item={story} />
            </SettingsProvider>
        </MemoryRouter>
    );
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('Item', () => {
    it('renders an external link with its domain for stories that have a url', () => {
        renderItem(makeStory());

        const title = screen.getByRole('link', { name: 'A React story' });
        expect(title).toHaveClass('title');
        expect(title).toHaveAttribute('href', 'https://example.com/story');
        expect(title).not.toHaveAttribute('target');
        expect(title).not.toHaveAttribute('rel');
        expect(screen.getByText('(example.com)')).toHaveClass('domain');
    });

    it('links to the item details page for stories without an external url', () => {
        renderItem(makeStory({ id: 7, url: 'item?id=7', domain: undefined }));

        const title = screen.getByRole('link', { name: 'A React story' });
        expect(title).toHaveClass('title');
        expect(title).toHaveAttribute('href', '/item/7');
        expect(screen.queryByText(/\(.*\)/)).toBeNull();
    });

    it('links to the item details page when the story has no url at all', () => {
        renderItem(makeStory({ id: 9, url: undefined, domain: undefined }));

        expect(screen.getByRole('link', { name: 'A React story' })).toHaveAttribute('href', '/item/9');
    });

    it('renders the user, points, time and comment count', () => {
        const { container } = renderItem(makeStory({ id: 5, user: 'pg', points: 12, comments_count: 1 }));

        const userLinks = screen.getAllByRole('link', { name: 'pg' });
        expect(userLinks).toHaveLength(2);
        userLinks.forEach((link) => expect(link).toHaveAttribute('href', '/user/pg'));
        expect(screen.getByText('12 ★')).toBeInTheDocument();

        const commentLinks = screen.getAllByRole('link', { name: '1 comment' });
        expect(commentLinks).toHaveLength(1);
        expect(commentLinks[0]).toHaveAttribute('href', '/item/5');
        expect(screen.getByRole('link', { name: '• 1 comment' })).toHaveClass('comment-number');

        expect(container.querySelector('.subtext-palm')).toHaveTextContent('2 hours ago • 1 comment');
        expect(container.querySelector('.subtext-laptop')).toHaveTextContent('12 points by pg2 hours ago | 1 comment');
    });

    it('renders "discuss" when a story has no comments', () => {
        const { container } = renderItem(makeStory({ comments_count: 0 }));

        expect(container.querySelector('.subtext-palm')).toHaveTextContent('• discuss');
        expect(container.querySelector('.subtext-laptop')).toHaveTextContent('| discuss');
    });

    it('omits the user, points and comments for job items', () => {
        renderItem(makeStory({ type: 'job', title: 'Work at a startup', comments_count: 0 }));

        expect(screen.queryByRole('link', { name: 'dan' })).toBeNull();
        expect(screen.queryByText('42 ★')).toBeNull();
        expect(screen.queryByRole('link', { name: /discuss/ })).toBeNull();
        expect(screen.getAllByText('2 hours ago')).toHaveLength(2);
    });

    it('does not add the item-details class on the laptop subtext for job items', () => {
        const { container } = renderItem(makeStory({ type: 'job' }));

        expect(container.querySelector('.subtext-laptop .item-details')).toBeNull();
    });

    it('adds the item-details class on the laptop subtext for regular items', () => {
        const { container } = renderItem(makeStory());

        expect(container.querySelector('.subtext-laptop .item-details')).not.toBeNull();
    });

    it('opens external links in a new tab when the setting is enabled', () => {
        localStorage.setItem('openLinkInNewTab', 'true');

        renderItem(makeStory());

        const title = screen.getByRole('link', { name: 'A React story' });
        expect(title).toHaveAttribute('target', '_blank');
        expect(title).toHaveAttribute('rel', 'noopener');
    });

    it('applies the title font size and list spacing settings', () => {
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '15');

        const { container } = renderItem(makeStory());

        expect(screen.getByRole('link', { name: 'A React story' })).toHaveStyle({ fontSize: '20px' });
        expect(container.querySelector('.item-block > div')).toHaveStyle({ marginBottom: '15px' });
    });

    it('falls back to the default font size and spacing', () => {
        const { container } = renderItem(makeStory());

        expect(screen.getByRole('link', { name: 'A React story' })).toHaveStyle({ fontSize: '16px' });
        expect(container.querySelector('.item-block > div')).toHaveStyle({ marginBottom: '0px' });
    });
});
