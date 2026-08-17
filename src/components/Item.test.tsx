import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Item } from './Item';
import { SettingsProvider } from '../context/SettingsProvider';
import type { Story } from '../models';

const baseStory: Story = {
    id: 1,
    title: 'A linked story',
    points: 42,
    user: 'pg',
    time: 0,
    time_ago: '2 hours ago',
    type: 'story',
    url: 'https://example.com/story',
    domain: 'example.com',
    comments: [],
    comments_count: 3,
};

function renderItem(item: Story) {
    return render(
        <MemoryRouter>
            <SettingsProvider>
                <div className="item-block">
                    <Item item={item} />
                </div>
            </SettingsProvider>
        </MemoryRouter>
    );
}

describe('Item', () => {
    it('links the title externally when the story has a url', () => {
        const { container } = renderItem(baseStory);
        const title = screen.getByRole('link', { name: 'A linked story' });
        expect(title).toHaveAttribute('href', 'https://example.com/story');
        expect(title).not.toHaveAttribute('target');
        expect(container.querySelector('.domain')).toHaveTextContent('(example.com)');
    });

    it('links the title to the item page when there is no url', () => {
        renderItem({ ...baseStory, url: 'item?id=1', domain: undefined });
        expect(screen.getByRole('link', { name: 'A linked story' })).toHaveAttribute('href', '/item/1');
    });

    it('renders points, user and comment count for stories', () => {
        const { container } = renderItem(baseStory);
        expect(container.querySelector('.subtext-laptop')).toHaveTextContent('42 points by pg');
        expect(screen.getAllByRole('link', { name: /3 comments/ }).length).toBe(2);
        expect(container.querySelector('.subtext-palm .right')).toHaveTextContent('42 ★');
    });

    it('hides points, user and comments for job items', () => {
        const { container } = renderItem({ ...baseStory, type: 'job', comments_count: 0 });
        expect(container.querySelector('.subtext-laptop')).not.toHaveTextContent('points by');
        expect(screen.queryByRole('link', { name: /discuss|comment/ })).toBeNull();
        expect(container.querySelector('.subtext-palm')).toHaveTextContent('2 hours ago');
    });
});
