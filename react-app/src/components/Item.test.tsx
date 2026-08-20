import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { SettingsProvider } from '../context/SettingsProvider';
import type { Story } from '../types';
import { Item } from './Item';

const story = {
    id: 1,
    title: 'A React story',
    points: 12,
    user: 'pg',
    time_ago: '2 hours ago',
    type: 'story',
    url: 'https://example.com/story',
    domain: 'example.com',
    comments_count: 1,
} as Story;

describe('Item', () => {
    it('renders the story title, domain and comment count', () => {
        render(
            <SettingsProvider>
                <MemoryRouter>
                    <Item item={story} />
                </MemoryRouter>
            </SettingsProvider>
        );

        expect(screen.getByRole('link', { name: 'A React story' })).toHaveAttribute(
            'href',
            'https://example.com/story'
        );
        expect(screen.getAllByText('(example.com)')).toHaveLength(1);
        expect(screen.getAllByText('1 comment').length).toBeGreaterThan(0);
    });
});
