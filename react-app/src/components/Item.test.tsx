import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { SettingsProvider } from '../context/SettingsProvider';
import type { Story } from '../types';
import { Item } from './Item';

const story = {
    id: 42,
    title: 'A React story',
    points: 128,
    user: 'devin',
    time: 0,
    time_ago: '2 hours ago',
    type: 'story',
    url: 'https://example.com/story',
    domain: 'example.com',
    comments_count: 1,
    comments: [],
} as unknown as Story;

describe('Item', () => {
    it('renders the story title, domain and comment count', () => {
        render(
            <MemoryRouter>
                <SettingsProvider>
                    <Item item={story} />
                </SettingsProvider>
            </MemoryRouter>
        );

        expect(screen.getByRole('link', { name: 'A React story' })).toHaveAttribute(
            'href',
            'https://example.com/story'
        );
        expect(screen.getByText('(example.com)')).toBeInTheDocument();
        expect(screen.getAllByText('1 comment').length).toBeGreaterThan(0);
    });
});
