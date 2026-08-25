import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SettingsProvider } from '../context/SettingsContext';
import type { Story } from '../models/story';
import Item, { hasUrl } from './Item';

function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 1,
        title: 'A story',
        points: 42,
        user: 'pg',
        time: 0,
        time_ago: '2 hours ago',
        type: 'story',
        url: 'https://example.com/post',
        domain: 'example.com',
        content: '',
        text: '',
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
        <MemoryRouter>
            <SettingsProvider>
                <Item item={item} />
            </SettingsProvider>
        </MemoryRouter>
    );
}

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe('hasUrl', () => {
    it('is true only for external http(s) urls', () => {
        expect(hasUrl(makeStory())).toBe(true);
        expect(hasUrl(makeStory({ url: 'item?id=1' }))).toBe(false);
    });
});

describe('Item', () => {
    it('links externally and shows the domain when the story has a url', () => {
        renderItem(makeStory());

        const title = screen.getByRole('link', { name: 'A story' });
        expect(title.getAttribute('href')).toBe('https://example.com/post');
        expect(title.getAttribute('target')).toBeNull();
        expect(screen.getByText('(example.com)')).toBeTruthy();
    });

    it('links to the item details when the story has no url', () => {
        renderItem(makeStory({ url: '' }));

        expect(screen.getByRole('link', { name: 'A story' }).getAttribute('href')).toBe('/item/1');
    });

    it('opens external links in a new tab when the setting is on', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        renderItem(makeStory());

        const title = screen.getByRole('link', { name: 'A story' });
        expect(title.getAttribute('target')).toBe('_blank');
        expect(title.getAttribute('rel')).toBe('noopener');
    });

    it('applies the title font size and list spacing settings', () => {
        localStorage.setItem('titleFontSize', '22');
        localStorage.setItem('listSpacing', '7');
        const { container } = renderItem(makeStory());

        expect(container.querySelector<HTMLElement>('.title')?.style.fontSize).toBe('22px');
        expect(container.querySelector<HTMLElement>('div')?.style.marginBottom).toBe('7px');
    });

    it('renders the comment count and author for stories', () => {
        renderItem(makeStory());

        expect(screen.getAllByText(/3 comments/).length).toBe(2);
        expect(screen.getAllByRole('link', { name: 'pg' }).length).toBe(2);
    });

    it('hides points, author and comments for jobs', () => {
        renderItem(makeStory({ type: 'job' }));

        expect(screen.queryByText('pg')).toBeNull();
        expect(screen.queryByText(/3 comments/)).toBeNull();
        expect(screen.getAllByText('2 hours ago').length).toBe(2);
    });
});
