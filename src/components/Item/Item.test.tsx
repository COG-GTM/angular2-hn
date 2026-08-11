import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import Item from './Item';
import { SettingsProvider } from '../../context/SettingsContext';
import type { Story } from '../../models/story';

const story = {
    id: 1,
    title: 'A story',
    points: 12,
    user: 'someone',
    time_ago: '2 hours ago',
    type: 'story',
    url: 'https://example.com/story',
    domain: 'example.com',
    comments: [],
    comments_count: 1,
} as unknown as Story;

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
    it('links external stories to their url', () => {
        renderItem(story);
        expect(screen.getAllByRole('link', { name: 'A story' })[0]).toHaveAttribute(
            'href',
            'https://example.com/story'
        );
        expect(screen.getAllByText('1 comment').length).toBeGreaterThan(0);
    });

    it('links stories without an external url to the item page', () => {
        renderItem({ ...story, url: 'item?id=1', domain: '' });
        expect(screen.getAllByRole('link', { name: 'A story' })[0]).toHaveAttribute('href', '/item/1');
    });
});
