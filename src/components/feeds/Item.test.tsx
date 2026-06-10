import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Item from './Item';
import { SettingsProvider } from '../../contexts/SettingsContext';
import { Story } from '../../models/story';

function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 1,
        title: 'A great link',
        points: 42,
        user: 'pg',
        time: 0,
        time_ago: '2 hours ago',
        type: 'link' as Story['type'],
        url: 'https://example.com/post',
        domain: 'example.com',
        comments: [],
        comments_count: 3,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
        content: '',
        ...overrides,
    };
}

function renderItem(story: Story) {
    return render(
        <MemoryRouter>
            <SettingsProvider>
                <Item item={story} />
            </SettingsProvider>
        </MemoryRouter>,
    );
}

describe('Item', () => {
    it('renders the title linking to the external url with the domain', () => {
        renderItem(makeStory());
        const title = screen.getByRole('link', { name: 'A great link' });
        expect(title).toHaveAttribute('href', 'https://example.com/post');
        expect(screen.getByText('(example.com)')).toBeInTheDocument();
    });

    it('renders points, user and the formatted comment count', () => {
        renderItem(makeStory({ comments_count: 1 }));
        expect(screen.getByText(/42 points by/)).toBeInTheDocument();
        expect(screen.getAllByRole('link', { name: 'pg' }).length).toBeGreaterThan(0);
        expect(screen.getAllByText('1 comment').length).toBeGreaterThan(0);
    });

    it('shows "discuss" when there are no comments', () => {
        renderItem(makeStory({ comments_count: 0 }));
        expect(screen.getAllByText('discuss').length).toBeGreaterThan(0);
    });

    it('hides points/comments metadata for job posts', () => {
        renderItem(makeStory({ type: 'job' as Story['type'], comments_count: 0 }));
        expect(screen.queryByText(/points by/)).not.toBeInTheDocument();
    });
});
