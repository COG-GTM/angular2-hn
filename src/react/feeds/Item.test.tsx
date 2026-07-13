import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { Item } from './Item';
import { SettingsProvider } from '../services/settings-context';
import { makeStory } from '../test/fixtures';
import { Story } from '../models/story';

function renderItem(story: Story) {
    return render(
        <MemoryRouter>
            <SettingsProvider>
                <Item item={story} />
            </SettingsProvider>
        </MemoryRouter>
    );
}

describe('Item', () => {
    it('renders an external title link with the story url when it has one', () => {
        renderItem(makeStory({ title: 'External story', url: 'https://example.com/x' }));
        const link = screen.getAllByRole('link', { name: 'External story' })[0];
        expect(link).toHaveAttribute('href', 'https://example.com/x');
    });

    it('links the title to the item detail page when there is no external url', () => {
        renderItem(makeStory({ title: 'Ask HN: something', url: 'item?id=123', id: 123 }));
        const link = screen.getAllByRole('link', { name: 'Ask HN: something' })[0];
        expect(link).toHaveAttribute('href', '/item/123');
    });

    it('shows points, the author, and the comment count for non-job items', () => {
        renderItem(makeStory({ points: 99, user: 'alice', comments_count: 1 }));
        expect(screen.getAllByText(/99/).length).toBeGreaterThan(0);
        expect(screen.getAllByRole('link', { name: 'alice' })[0]).toHaveAttribute('href', '/user/alice');
        expect(screen.getAllByText('1 comment').length).toBeGreaterThan(0);
    });

    it('does not render points or comments for job items', () => {
        renderItem(makeStory({ type: 'job', title: 'Job posting', url: 'https://jobs.example.com' }));
        expect(screen.queryByText(/points by/)).not.toBeInTheDocument();
        expect(screen.queryByText('discuss')).not.toBeInTheDocument();
    });
});
