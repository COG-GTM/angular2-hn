import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import type { Story } from '../models';
import { SettingsProvider, useSettings } from '../settings';
import { mockMatchMedia } from '../test/matchMedia';
import { StoryItem } from './index';

const externalStory: Story = {
    id: 1,
    title: 'A great external story',
    points: 42,
    user: 'pg',
    time: 1234,
    time_ago: '2 hours ago',
    type: 'story',
    url: 'https://example.com/great',
    domain: 'example.com',
    comments: [],
    comments_count: 5,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
} as unknown as Story;

function renderStoryItem(item: Story) {
    return render(
        <MemoryRouter>
            <SettingsProvider>
                <StoryItem item={item} />
            </SettingsProvider>
        </MemoryRouter>
    );
}

function SettingsControls() {
    const { toggleOpenLinksInNewTab, setFont, setSpacing } = useSettings();
    return (
        <div>
            <button onClick={toggleOpenLinksInNewTab}>new tab</button>
            <button onClick={() => setFont('20')}>font</button>
            <button onClick={() => setSpacing('12')}>spacing</button>
        </div>
    );
}

describe('StoryItem', () => {
    beforeEach(() => {
        localStorage.clear();
        mockMatchMedia(false);
    });

    it('renders an external story with domain, points, user, time and comment count in both layouts', () => {
        const { container } = renderStoryItem(externalStory);

        const titleLink = screen.getByRole('link', { name: 'A great external story' });
        expect(titleLink).toHaveAttribute('href', 'https://example.com/great');
        expect(titleLink).toHaveClass('title');
        expect(titleLink).not.toHaveAttribute('target');
        expect(titleLink).not.toHaveAttribute('rel');
        expect(screen.getByText('(example.com)')).toHaveClass('domain');

        const palm = container.querySelector('.subtext-palm');
        expect(palm).not.toBeNull();
        expect(palm?.querySelector('.name a')).toHaveAttribute('href', '/user/pg');
        expect(palm?.querySelector('.right')?.textContent).toBe('42 ★');
        expect(palm?.querySelector('.comment-number')).toHaveAttribute('href', '/item/1');
        expect(palm?.querySelector('.comment-number')?.textContent).toContain('5 comments');
        expect(palm?.textContent).toContain('2 hours ago');

        const laptop = container.querySelector('.subtext-laptop');
        expect(laptop?.textContent).toContain('42 points by');
        expect(laptop?.textContent).toContain('pg');
        expect(laptop?.textContent).toContain('2 hours ago');
        expect(laptop?.textContent).toContain('5 comments');
        expect(laptop?.querySelector('.item-details')).not.toBeNull();
    });

    it('hides the domain span when the story has no domain', () => {
        const { container } = renderStoryItem({ ...externalStory, domain: '' });
        expect(container.querySelector('.domain')).toBeNull();
    });

    it('links internally when the story has no external url', () => {
        renderStoryItem({ ...externalStory, url: 'item?id=1', domain: '' });
        const titleLink = screen.getByRole('link', { name: 'A great external story' });
        expect(titleLink).toHaveAttribute('href', '/item/1');
        expect(titleLink).toHaveClass('title');
    });

    it('hides points, user and comments for job items', () => {
        const { container } = renderStoryItem({ ...externalStory, type: 'job', comments_count: 0 });

        expect(container.querySelector('.subtext-palm .name')).toBeNull();
        expect(container.querySelector('.subtext-palm .comment-number')).toBeNull();
        expect(container.querySelector('.subtext-laptop .item-details')).toBeNull();
        expect(container.querySelector('.subtext-palm')?.textContent).toBe('2 hours ago');
        expect(container.querySelector('.subtext-laptop')?.textContent).toBe('2 hours ago');
    });

    it('renders "discuss" with no comments and singular "comment" for one', () => {
        const { container: none } = renderStoryItem({ ...externalStory, comments_count: 0 });
        expect(none.querySelector('.comment-number')?.textContent).toContain('discuss');

        const { container: one } = renderStoryItem({ ...externalStory, comments_count: 1 });
        expect(one.querySelector('.comment-number')?.textContent).toContain('1 comment');
    });

    it('applies the settings-driven new tab attributes, font size and list spacing', async () => {
        const user = userEvent.setup();
        const { container } = render(
            <MemoryRouter>
                <SettingsProvider>
                    <SettingsControls />
                    <StoryItem item={externalStory} />
                </SettingsProvider>
            </MemoryRouter>
        );

        const block = container.querySelector('.item-block');
        expect(block).toHaveStyle({ marginBottom: '0px' });
        expect(screen.getByRole('link', { name: 'A great external story' })).toHaveStyle({ fontSize: '16px' });

        await user.click(screen.getByRole('button', { name: 'new tab' }));
        await user.click(screen.getByRole('button', { name: 'font' }));
        await user.click(screen.getByRole('button', { name: 'spacing' }));

        const titleLink = screen.getByRole('link', { name: 'A great external story' });
        expect(titleLink).toHaveAttribute('target', '_blank');
        expect(titleLink).toHaveAttribute('rel', 'noopener');
        expect(titleLink).toHaveStyle({ fontSize: '20px' });
        expect(container.querySelector('.item-block')).toHaveStyle({ marginBottom: '12px' });
    });
});
