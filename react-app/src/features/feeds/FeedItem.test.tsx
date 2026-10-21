import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '../../shared/test-utils';
import { commentLabel } from '../../shared/utils';
import { FeedItem } from './FeedItem';
import { testStory } from './testStory';

function titleLinks() {
    return screen.getAllByRole('link').filter((a) => a.classList.contains('title'));
}

describe('commentLabel (Angular `comment` pipe)', () => {
    it.each([
        [0, 'discuss'],
        [undefined, 'discuss'],
        [null, 'discuss'],
        [-1, 'discuss'],
        [1, '1 comment'],
        [2, '2 comments'],
        [345, '345 comments'],
    ])('%s → %s', (count, label) => {
        expect(commentLabel(count)).toBe(label);
    });
});

describe('FeedItem', () => {
    it('renders an external title link with the domain, separated by one space', () => {
        const { container } = renderWithProviders(<FeedItem item={testStory()} />);
        const [title] = titleLinks();
        expect(title).toHaveAttribute('href', 'https://example.com/post');
        expect(title).not.toHaveAttribute('target');
        expect(title).not.toHaveAttribute('rel');
        expect(container.querySelector('.domain')).toHaveTextContent('(example.com)');
        expect(container.querySelector('.item-block p')?.textContent).toBe('Show HN: A thing (example.com)');
    });

    it('omits the domain when the API sends none', () => {
        const { container } = renderWithProviders(<FeedItem item={testStory({ domain: undefined })} />);
        expect(container.querySelector('.domain')).toBeNull();
    });

    it('opens external links in a new tab when openLinkInNewTab is set', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        renderWithProviders(<FeedItem item={testStory()} />);
        const [title] = titleLinks();
        expect(title).toHaveAttribute('target', '_blank');
        expect(title).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('links HN-relative URLs (Ask/Show text posts) to the item page', async () => {
        const { user } = renderWithProviders(
            <FeedItem item={testStory({ id: 42, url: 'item?id=42', domain: undefined, title: 'Ask HN: Why?' })} />,
            { otherRoutes: { '/item/:id': <p>item page</p> } }
        );
        const [title] = titleLinks();
        expect(title).toHaveAttribute('href', '/item/42');
        await user.click(title);
        expect(screen.getByText('item page')).toBeInTheDocument();
    });

    it('never renders an unsafe URL as a link target', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        renderWithProviders(<FeedItem item={testStory({ id: 7, url: 'javascript:alert(1)' })} />);
        const [title] = titleLinks();
        expect(title).toHaveAttribute('href', '/item/7');
        expect(title).not.toHaveAttribute('target');
    });

    it('renders user, points, time ago and the comments link in both layouts', () => {
        const { container } = renderWithProviders(<FeedItem item={testStory({ id: 9, comments_count: 1 })} />);
        const palm = container.querySelector('.subtext-palm')!;
        const laptop = container.querySelector('.subtext-laptop')!;

        expect(palm.querySelector('.name a')).toHaveAttribute('href', '/user/pg');
        expect(palm.querySelector('.right')).toHaveTextContent('120 ★');
        expect(palm.querySelector('.comment-number')).toHaveAttribute('href', '/item/9');
        expect(palm.querySelectorAll('.details')[1].textContent).toBe('3 hours ago • 1 comment');

        expect(laptop.textContent).toBe('120 points by pg 3 hours ago | 1 comment');
        expect(laptop.querySelector('.item-details')).not.toBeNull();
        expect(screen.getAllByRole('link', { name: 'pg' })).toHaveLength(2);
        expect(screen.getAllByRole('link', { name: /1 comment/ })).toHaveLength(2);
    });

    it.each([
        [0, 'discuss'],
        [12, '12 comments'],
    ])('labels %s comments as "%s"', (count, label) => {
        renderWithProviders(<FeedItem item={testStory({ comments_count: count })} />);
        expect(screen.getAllByRole('link', { name: new RegExp(label) })).toHaveLength(2);
    });

    it('shows only the time for job rows', () => {
        const { container } = renderWithProviders(
            <FeedItem item={testStory({ type: 'job', user: undefined as unknown as string, points: null as never })} />
        );
        expect(container.querySelector('.subtext-palm')?.textContent?.trim()).toBe('3 hours ago');
        expect(container.querySelector('.subtext-laptop')?.textContent?.trim()).toBe('3 hours ago');
        expect(container.querySelector('.item-details')).toBeNull();
        expect(container.querySelector('.comment-number')).toBeNull();
        expect(screen.getAllByRole('link')).toHaveLength(1);
    });

    it('applies titleFontSize to titles only and listSpacing as margin-bottom', () => {
        localStorage.setItem('titleFontSize', '22');
        localStorage.setItem('listSpacing', '14');
        const { container } = renderWithProviders(<FeedItem item={testStory()} />);
        expect(titleLinks()[0]).toHaveStyle({ fontSize: '22px' });
        expect(container.querySelector('.subtext-laptop a')).not.toHaveAttribute('style');
        expect(container.querySelector('.item-block > div')).toHaveStyle({ marginBottom: '14px' });
    });

    it('uses the default 16px titles and 0px spacing', () => {
        const { container } = renderWithProviders(<FeedItem item={testStory({ url: 'item?id=101' })} />);
        expect(titleLinks()[0]).toHaveStyle({ fontSize: '16px' });
        expect(container.querySelector('.item-block > div')).toHaveStyle({ marginBottom: '0px' });
    });

    it('is keyboard navigable: Enter on the user link navigates', async () => {
        const { user } = renderWithProviders(<FeedItem item={testStory()} />, {
            otherRoutes: { '/user/:id': <p>user page</p> },
        });
        await user.tab();
        expect(titleLinks()[0]).toHaveFocus();
        await user.tab();
        expect(screen.getAllByRole('link', { name: 'pg' })[0]).toHaveFocus();
        await user.keyboard('{Enter}');
        expect(screen.getByText('user page')).toBeInTheDocument();
    });
});
