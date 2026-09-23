import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import type { Story } from '../../models';
import { SettingsProvider } from '../../settings/SettingsContext';
import { Item } from './Item';

const story: Story = {
    id: 123,
    title: 'A linked story',
    points: 42,
    user: 'pg',
    time: 1600000000,
    time_ago: '2 hours ago',
    type: 'story',
    url: 'https://example.com/post',
    domain: 'example.com',
    comments: [],
    comments_count: 3,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
};

function renderItem(overrides: Partial<Story> = {}) {
    return render(
        <MemoryRouter>
            <SettingsProvider>
                <Item item={{ ...story, ...overrides }} />
            </SettingsProvider>
        </MemoryRouter>
    );
}

describe('Item', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('links an external story to its url and shows the domain', () => {
        renderItem();

        const title = screen.getByRole('link', { name: 'A linked story' });
        expect(title).toHaveAttribute('href', 'https://example.com/post');
        expect(title).toHaveClass('title');
        expect(screen.getByText('(example.com)')).toHaveClass('domain');
    });

    it('links an internal story to /item/:id and renders no domain', () => {
        renderItem({ url: 'item?id=123', domain: '' });

        expect(screen.getByRole('link', { name: 'A linked story' })).toHaveAttribute('href', '/item/123');
        expect(document.querySelector('.domain')).toBeNull();
    });

    it('renders points, the user link, time ago and the comment count', () => {
        const { container } = renderItem();

        expect(screen.getByText('42 ★')).toBeInTheDocument();
        screen.getAllByRole('link', { name: 'pg' }).forEach((link) => {
            expect(link).toHaveAttribute('href', '/user/pg');
        });
        expect(container.querySelector('.subtext-palm')).toHaveTextContent('2 hours ago');
        expect(container.querySelector('.comment-number')).toHaveTextContent('3 comments');
        expect(container.querySelector('.subtext-laptop')).toHaveTextContent('42 points by pg 2 hours ago | 3 comments');
    });

    it('renders "discuss" when a story has no comments, as the comment pipe did', () => {
        const { container } = renderItem({ comments_count: 0 });

        expect(container.querySelector('.comment-number')).toHaveTextContent('discuss');
    });

    it('hides points, user and comment links for job posts', () => {
        const { container } = renderItem({ type: 'job', domain: '' });

        expect(screen.queryByRole('link', { name: 'pg' })).toBeNull();
        expect(container.querySelector('.comment-number')).toBeNull();
        expect(container.querySelector('.item-details')).toBeNull();
        expect(container.querySelector('.subtext-palm')).toHaveTextContent('2 hours ago');
        expect(container.querySelector('.subtext-laptop')).toHaveTextContent('2 hours ago');
        expect(container.querySelector('.subtext-laptop')).not.toHaveTextContent('42');
    });

    it('opens external links in a new tab only when the setting is on', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        renderItem();

        const title = screen.getByRole('link', { name: 'A linked story' });
        expect(title).toHaveAttribute('target', '_blank');
        expect(title).toHaveAttribute('rel', 'noopener');
    });

    it('does not set target or rel when links open in the same tab', () => {
        renderItem();

        const title = screen.getByRole('link', { name: 'A linked story' });
        expect(title).not.toHaveAttribute('target');
        expect(title).not.toHaveAttribute('rel');
    });

    it('applies the title font size and list spacing settings', () => {
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '12');
        const { container } = renderItem();

        expect(container.firstElementChild).toHaveStyle({ marginBottom: '12px' });
        expect(screen.getByRole('link', { name: 'A linked story' })).toHaveStyle({ fontSize: '20px' });
    });
});
