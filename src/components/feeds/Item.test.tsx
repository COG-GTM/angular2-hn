import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { SettingsProvider } from '../../context/SettingsContext';
import type { Story } from '../../models/story';
import Item from './Item';

const story = {
    id: 1,
    title: 'A story',
    points: 42,
    user: 'pg',
    time_ago: '2 hours ago',
    type: 'story',
    url: 'https://example.com/story',
    domain: 'example.com',
    comments_count: 1,
} as Story;

function renderItem(item: Story) {
    return render(
        <SettingsProvider>
            <MemoryRouter>
                <Item item={item} />
            </MemoryRouter>
        </SettingsProvider>
    );
}

describe('Item', () => {
    it('links external stories to their url and shows the domain', () => {
        renderItem(story);

        expect(screen.getByRole('link', { name: 'A story' })).toHaveAttribute('href', 'https://example.com/story');
        expect(screen.getByText('(example.com)')).toBeInTheDocument();
        expect(screen.getAllByText('1 comment').length).toBeGreaterThan(0);
    });

    it('links internal stories to the item page', () => {
        renderItem({ ...story, url: 'item?id=1' });

        expect(screen.getByRole('link', { name: 'A story' })).toHaveAttribute('href', '/item/1');
    });

    it('hides points and comments for jobs', () => {
        renderItem({ ...story, type: 'job' });

        expect(screen.queryByText('pg')).not.toBeInTheDocument();
        expect(screen.queryByText('1 comment')).not.toBeInTheDocument();
    });
});
