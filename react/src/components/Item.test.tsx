// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Item from './Item';
import { SettingsProvider } from '../context/SettingsContext';
import type { Story } from '../models';

function mockMatchMedia() {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    }));
}

function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 1,
        title: 'A story',
        points: 42,
        user: 'alice',
        time: 0,
        time_ago: '2 hours ago',
        type: 'story',
        url: 'https://example.com/article',
        domain: 'example.com',
        comments: [],
        comments_count: 3,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
        ...overrides,
    };
}

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
    beforeEach(() => {
        localStorage.clear();
        mockMatchMedia();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders external link with domain when item has a url', () => {
        renderItem(makeStory());
        const title = screen.getByText('A story');
        expect(title.tagName).toBe('A');
        expect(title).toHaveProperty('href', 'https://example.com/article');
        expect(screen.getByText('(example.com)')).toBeTruthy();
    });

    it('renders internal item link when item has no url', () => {
        renderItem(makeStory({ url: 'item?id=1', domain: '' }));
        const title = screen.getByText('A story');
        expect(title.getAttribute('href')).toBe('/item/1');
    });

    it('shows points, user and comment label for non-job items', () => {
        renderItem(makeStory());
        expect(screen.getAllByText('alice').length).toBeGreaterThan(0);
        expect(screen.getAllByText(/3 comments/).length).toBeGreaterThan(0);
    });

    it('hides points, user and comments for job items', () => {
        renderItem(makeStory({ type: 'job', user: '', comments_count: 0 }));
        expect(screen.queryByText(/points by/)).toBeNull();
        expect(screen.queryByText(/discuss/)).toBeNull();
    });
});
