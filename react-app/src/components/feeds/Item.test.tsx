import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { SettingsProvider } from '../../context/SettingsContext';
import type { Story } from '../../models/story';
import Item, { hasUrl } from './Item';

const story: Story = {
    id: 1,
    title: 'A linked story',
    points: 42,
    user: 'pg',
    time: 0,
    time_ago: 0,
    type: 'story',
    url: 'https://example.com/post',
    domain: 'example.com',
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
    it('detects external urls', () => {
        expect(hasUrl(story)).toBe(true);
        expect(hasUrl({ ...story, url: 'item?id=1' })).toBe(false);
        expect(hasUrl({ ...story, url: undefined })).toBe(false);
    });

    it('links external stories to their url and shows the domain', () => {
        renderItem(story);

        const link = screen.getByRole('link', { name: 'A linked story' });
        expect(link).toHaveAttribute('href', 'https://example.com/post');
        expect(link).not.toHaveAttribute('target');
        expect(screen.getByText('(example.com)')).toBeInTheDocument();
        expect(screen.getAllByText(/3 comments/).length).toBe(2);
    });

    it('links self posts to the item page', () => {
        renderItem({ ...story, url: undefined, domain: undefined });

        expect(screen.getByRole('link', { name: 'A linked story' })).toHaveAttribute(
            'href',
            '/item/1'
        );
    });

    it('hides points and comments for jobs', () => {
        renderItem({ ...story, type: 'job' });

        expect(screen.queryByText('pg')).not.toBeInTheDocument();
        expect(screen.queryByText(/comments/)).not.toBeInTheDocument();
    });
});
