import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SettingsProvider } from '../context/SettingsContext';
import Item from '../components/Item';
import type { Story } from '../models/Story';

const mockStory: Story = {
    id: 1,
    title: 'Test Story',
    points: 42,
    user: 'testuser',
    time: 123,
    time_ago: '3 hours ago',
    type: 'story',
    url: 'https://example.com',
    domain: 'example.com',
    content: '',
    comments: [],
    comments_count: 5,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
};

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
    it('renders story title as external link when URL starts with http', () => {
        renderItem(mockStory);
        const link = screen.getByText('Test Story');
        expect(link).toHaveAttribute('href', 'https://example.com');
    });

    it('renders domain for external URLs', () => {
        renderItem(mockStory);
        expect(screen.getByText('(example.com)')).toBeInTheDocument();
    });

    it('renders story title as internal link when no http URL', () => {
        renderItem({ ...mockStory, url: 'item?id=1' });
        const link = screen.getByText('Test Story');
        expect(link).toHaveAttribute('href', '/item/1');
    });

    it('renders comment count using commentLabel', () => {
        renderItem(mockStory);
        expect(screen.getAllByText(/5 comments/).length).toBeGreaterThan(0);
    });

    it('renders user link', () => {
        renderItem(mockStory);
        expect(screen.getAllByText('testuser').length).toBeGreaterThan(0);
    });

    it('hides points and user for job type', () => {
        renderItem({ ...mockStory, type: 'job' });
        expect(screen.queryByText(/42 points/)).not.toBeInTheDocument();
    });
});
