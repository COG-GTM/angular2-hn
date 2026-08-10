import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { Settings } from '../../shared/models/settings';
import type { Story } from '../../shared/models/story';
import { SettingsContext } from '../../shared/services/settingsContext';
import type { SettingsContextValue } from '../../shared/services/settingsContext';
import Item from './Item';

const baseStory: Story = {
    id: 123,
    title: 'A very interesting story',
    points: 42,
    user: 'pg',
    time: 1_500_000_000,
    time_ago: '3 hours ago',
    type: 'news',
    url: 'https://example.com/story',
    domain: 'example.com',
    comments: [],
    comments_count: 7,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
};

function makeStory(overrides: Partial<Story> = {}): Story {
    return { ...baseStory, ...overrides };
}

const defaultSettings: Settings = {
    showSettings: false,
    openLinkInNewTab: false,
    theme: 'default',
    titleFontSize: '16',
    listSpacing: '0',
};

function renderItem(item: Story, settingsOverrides: Partial<Settings> = {}) {
    const value: SettingsContextValue = {
        settings: { ...defaultSettings, ...settingsOverrides },
        toggleSettings: vi.fn(),
        toggleOpenLinksInNewTab: vi.fn(),
        setTheme: vi.fn(),
        setFont: vi.fn(),
        setSpacing: vi.fn(),
    };

    return render(
        <MemoryRouter>
            <SettingsContext.Provider value={value}>
                <Item item={item} />
            </SettingsContext.Provider>
        </MemoryRouter>
    );
}

describe('Item', () => {
    it('renders an external story title as an anchor with the domain', () => {
        const { container } = renderItem(makeStory());

        const title = screen.getByRole('link', { name: 'A very interesting story' });
        expect(title).toHaveAttribute('href', 'https://example.com/story');
        expect(title).toHaveClass('title');
        expect(container.querySelector('.domain')).toHaveTextContent('(example.com)');
    });

    it('renders a self post title as a router link to the item page', () => {
        const { container } = renderItem(makeStory({ url: 'item?id=123', domain: '' }));

        const title = screen.getByRole('link', { name: 'A very interesting story' });
        expect(title).toHaveAttribute('href', '/item/123');
        expect(container.querySelector('.domain')).toBeNull();
    });

    it('treats a missing url as a self post', () => {
        renderItem(makeStory({ url: undefined as unknown as string, domain: '' }));

        expect(screen.getByRole('link', { name: 'A very interesting story' })).toHaveAttribute('href', '/item/123');
    });

    it.each([
        [0, 'discuss'],
        [1, '1 comment'],
        [7, '7 comments'],
    ])('renders %i comments as "%s" linking to the item page', (count, expected) => {
        const { container } = renderItem(makeStory({ comments_count: count }));

        const commentLinks = screen.getAllByRole('link', { name: new RegExp(expected) });
        expect(commentLinks.length).toBe(2);
        for (const link of commentLinks) {
            expect(link).toHaveAttribute('href', '/item/123');
        }
        expect(container.querySelector('.comment-number')).toHaveTextContent(`• ${expected}`);
    });

    it('renders the user link and the points in both layouts', () => {
        const { container } = renderItem(makeStory());

        const userLinks = screen.getAllByRole('link', { name: 'pg' });
        expect(userLinks.length).toBe(2);
        for (const link of userLinks) {
            expect(link).toHaveAttribute('href', '/user/pg');
        }

        const palm = container.querySelector('.subtext-palm') as HTMLElement;
        expect(within(palm).getByText('42 ★')).toHaveClass('right');
        expect(palm).toHaveTextContent('3 hours ago');

        const laptop = container.querySelector('.subtext-laptop') as HTMLElement;
        expect(laptop).toHaveTextContent('42 points by pg');
        expect(laptop.querySelector('.item-details')).toHaveTextContent('3 hours ago');
    });

    it('hides user, points and comments for job postings', () => {
        const { container } = renderItem(makeStory({ type: 'job', comments_count: 0 }));

        expect(screen.queryByRole('link', { name: 'pg' })).toBeNull();
        expect(screen.queryByText(/points by/)).toBeNull();
        expect(screen.queryByText(/discuss/)).toBeNull();
        expect(container.querySelector('.comment-number')).toBeNull();
        expect(container.querySelector('.item-details')).toBeNull();
        expect(container.querySelector('.subtext-palm')).toHaveTextContent('3 hours ago');
    });

    it('applies the title font size and list spacing settings', () => {
        const { container } = renderItem(makeStory(), { titleFontSize: '20', listSpacing: '12' });

        expect(container.querySelector('.item-block')).toHaveStyle({ marginBottom: '12px' });
        expect(screen.getByRole('link', { name: 'A very interesting story' })).toHaveStyle({ fontSize: '20px' });
    });

    it('omits target and rel on the external link when openLinkInNewTab is false', () => {
        renderItem(makeStory(), { openLinkInNewTab: false });

        const title = screen.getByRole('link', { name: 'A very interesting story' });
        expect(title).not.toHaveAttribute('target');
        expect(title).not.toHaveAttribute('rel');
    });

    it('sets target and rel on the external link when openLinkInNewTab is true', () => {
        renderItem(makeStory(), { openLinkInNewTab: true });

        const title = screen.getByRole('link', { name: 'A very interesting story' });
        expect(title).toHaveAttribute('target', '_blank');
        expect(title).toHaveAttribute('rel', 'noopener');
    });
});
