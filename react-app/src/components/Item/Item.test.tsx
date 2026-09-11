import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { SettingsProvider } from '../../context/SettingsContext';
import type { Story } from '../../types';
import { Item } from './Item';

const story = (url: string): Story => ({
    id: 1,
    title: 'Title',
    url,
    domain: 'example.com',
    points: 4,
    user: 'user',
    time: 0,
    time_ago: '1 hour ago',
    type: 'story',
    comments: [],
    comments_count: 3,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
});
const renderItem = (item: Story) =>
    render(
        <MemoryRouter>
            <SettingsProvider>
                <Item item={item} />
            </SettingsProvider>
        </MemoryRouter>
    );

describe('Item', () => {
    it('renders external story links and comment count', () => {
        renderItem(story('https://example.com/story'));
        expect(screen.getByRole('link', { name: 'Title' })).toHaveAttribute('href', 'https://example.com/story');
        expect(screen.getByText('(example.com)')).toBeInTheDocument();
        expect(screen.getAllByText('3 comments').length).toBeGreaterThan(0);
    });
    it('renders internal links without a url', () => {
        renderItem(story(''));
        expect(screen.getByRole('link', { name: 'Title' })).toHaveAttribute('href', '/item/1');
    });
});
