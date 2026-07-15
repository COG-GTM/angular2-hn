import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Story } from '../models';

// Mocked settings — overridden per test via `currentSettings`.
let currentSettings: {
    openLinkInNewTab: boolean;
    titleFontSize: string;
    listSpacing: string;
    theme: string;
    showSettings: boolean;
};

vi.mock('../context/SettingsContext', () => ({
    useSettings: () => ({ settings: currentSettings }),
}));

import Item from './Item';

function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 42,
        title: 'Example Story',
        points: 123,
        user: 'alice',
        time: 0,
        time_ago: '2 hours ago' as unknown as number,
        type: 'story',
        url: 'https://example.com/post',
        domain: 'example.com',
        comments: [],
        comments_count: 5,
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
            <Item item={item} />
        </MemoryRouter>
    );
}

beforeEach(() => {
    currentSettings = {
        openLinkInNewTab: false,
        titleFontSize: '16',
        listSpacing: '0',
        theme: 'default',
        showSettings: false,
    };
});

describe('Item', () => {
    it('renders an external link for url stories with the domain span', () => {
        const { container } = renderItem(makeStory());
        const title = screen.getByText('Example Story') as HTMLAnchorElement;
        expect(title.tagName).toBe('A');
        expect(title.getAttribute('href')).toBe('https://example.com/post');
        expect(title.style.fontSize).toBe('16px');
        expect(screen.getByText('(example.com)')).toBeTruthy();
        // No new-tab attributes when openLinkInNewTab is false.
        expect(title.getAttribute('target')).toBeNull();
        expect(title.getAttribute('rel')).toBeNull();
        expect(container.querySelector('div')?.style.marginBottom).toBe('0px');
    });

    it('applies target/rel when openLinkInNewTab is true', () => {
        currentSettings.openLinkInNewTab = true;
        renderItem(makeStory());
        const title = screen.getByText('Example Story');
        expect(title.getAttribute('target')).toBe('_blank');
        expect(title.getAttribute('rel')).toBe('noopener');
    });

    it('applies the configured font size and list spacing', () => {
        currentSettings.titleFontSize = '20';
        currentSettings.listSpacing = '8';
        const { container } = renderItem(makeStory());
        expect((screen.getByText('Example Story') as HTMLElement).style.fontSize).toBe('20px');
        expect(container.querySelector('div')?.style.marginBottom).toBe('8px');
    });

    it('renders an internal /item link when the story has no external url', () => {
        renderItem(makeStory({ url: 'item?id=42', domain: '' }));
        const title = screen.getByText('Example Story') as HTMLAnchorElement;
        expect(title.getAttribute('href')).toBe('/item/42');
        expect(screen.queryByText('(example.com)')).toBeNull();
    });

    it('shows points, user and comment count for non-job stories', () => {
        renderItem(makeStory({ comments_count: 5 }));
        expect(screen.getAllByText('alice').length).toBeGreaterThan(0);
        expect(screen.getAllByText(/123/).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/5 comments/).length).toBeGreaterThan(0);
        const userLinks = screen.getAllByText('alice') as HTMLAnchorElement[];
        expect(userLinks[0].getAttribute('href')).toBe('/user/alice');
    });

    it('uses "1 comment" / "discuss" via formatCommentCount', () => {
        renderItem(makeStory({ comments_count: 1 }));
        expect(screen.getAllByText(/1 comment(?!s)/).length).toBeGreaterThan(0);
    });

    it('hides points, user and comment links for job items', () => {
        renderItem(makeStory({ type: 'job' }));
        expect(screen.queryByText('alice')).toBeNull();
        expect(screen.queryByText(/comments/)).toBeNull();
        expect(screen.queryByText(/points by/)).toBeNull();
    });
});
