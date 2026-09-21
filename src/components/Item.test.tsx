import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { SettingsProvider } from '../context';
import type { Story } from '../models';
import { Item } from './Item';

function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 1,
        title: 'A story',
        points: 42,
        user: 'pg',
        time: 0,
        time_ago: '2 hours ago',
        type: 'story',
        url: 'https://example.com/a',
        domain: 'example.com',
        comments: [],
        comments_count: 3,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
        ...overrides,
    } as Story;
}

function renderItem(item: Story) {
    return render(
        <MemoryRouter>
            <SettingsProvider>
                <Item item={item} />
            </SettingsProvider>
        </MemoryRouter>
    );
}

beforeEach(() => {
    localStorage.clear();
});

describe('Item', () => {
    it('links externally when the item has a url', () => {
        renderItem(makeStory());

        const title = screen.getByRole('link', { name: 'A story' });

        expect(title).toHaveAttribute('href', 'https://example.com/a');
        expect(title).not.toHaveAttribute('target');
        expect(screen.getByText('(example.com)')).toBeInTheDocument();
    });

    it('links to the item details when there is no external url', () => {
        renderItem(makeStory({ url: 'item?id=1', domain: '' }));

        expect(screen.getByRole('link', { name: 'A story' })).toHaveAttribute('href', '/item/1');
        expect(screen.queryByText(/\(/)).not.toBeInTheDocument();
    });

    it('opens links in a new tab when the setting is enabled', () => {
        localStorage.setItem('openLinkInNewTab', 'true');

        renderItem(makeStory());

        const title = screen.getByRole('link', { name: 'A story' });

        expect(title).toHaveAttribute('target', '_blank');
        expect(title).toHaveAttribute('rel', 'noopener');
    });

    it('applies the font size and list spacing settings', () => {
        localStorage.setItem('titleFontSize', '22');
        localStorage.setItem('listSpacing', '8');

        const { container } = renderItem(makeStory());

        expect(screen.getByRole('link', { name: 'A story' })).toHaveStyle({ fontSize: '22px' });
        expect(container.firstChild).toHaveStyle({ marginBottom: '8px' });
    });

    it('shows points, author and comment count for stories', () => {
        renderItem(makeStory());

        expect(screen.getAllByRole('link', { name: 'pg' })[0]).toHaveAttribute('href', '/user/pg');
        expect(screen.getByText('42 ★')).toBeInTheDocument();
        expect(screen.getAllByText(/3 comments/)).toHaveLength(2);
    });

    it('hides author, points and comments for jobs', () => {
        renderItem(makeStory({ type: 'job', comments_count: 0 }));

        expect(screen.queryByRole('link', { name: 'pg' })).not.toBeInTheDocument();
        expect(screen.queryByText('42 ★')).not.toBeInTheDocument();
        expect(screen.queryByText('discuss')).not.toBeInTheDocument();
        expect(screen.getAllByText('2 hours ago')).toHaveLength(2);
    });
});
