import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import Item from './Item';
import { Story } from '../../models';
import { SettingsProvider } from '../../context/SettingsContext';

const story: Story = {
    id: 1,
    title: 'A React story',
    points: 42,
    user: 'devin',
    time: 1600000000,
    time_ago: '2 hours ago',
    type: 'story',
    url: 'https://example.com/react',
    domain: 'example.com',
    comments: [],
    comments_count: 3,
};

function renderItem(item: Story) {
    return render(
        <MemoryRouter>
            <SettingsProvider>
                <Item item={item} />
            </SettingsProvider>
        </MemoryRouter>
    );
}

describe('Item', () => {
    it('links externally when the story has a url', () => {
        renderItem(story);

        expect(screen.getByRole('link', { name: story.title })).toHaveAttribute('href', story.url);
        expect(screen.getByText('(example.com)')).toBeInTheDocument();
        expect(screen.getAllByRole('link', { name: '3 comments' }).length).toBeGreaterThan(0);
    });

    it('links to the item details when the story has no external url', () => {
        renderItem({ ...story, url: 'item?id=1', domain: undefined });

        expect(screen.getByRole('link', { name: story.title })).toHaveAttribute('href', '/item/1');
    });

    it('hides points and comments for jobs', () => {
        renderItem({ ...story, type: 'job' });

        expect(screen.queryByText(/points by/)).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /comment/ })).not.toBeInTheDocument();
    });
});
