import { screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { renderWithProviders } from '../../test';
import { Item } from './Item';
import { testStory } from './testStory';

function renderItem(...args: Parameters<typeof testStory>) {
    const item = testStory(...args);
    const view = renderWithProviders(<Item item={item} />, {
        otherRoutes: { '/item/:id': <p>item page</p>, '/user/:id': <p>user page</p> },
    });
    return { item, ...view };
}

const laptop = (container: HTMLElement) => container.querySelector<HTMLElement>('.subtext-laptop')!;
const palm = (container: HTMLElement) => container.querySelector<HTMLElement>('.subtext-palm')!;

afterEach(() => localStorage.clear());

describe('Item', () => {
    it('links the title to the external url with the domain next to it', () => {
        const { container } = renderItem();
        const title = container.querySelector('a.title')!;
        expect(title).toHaveAttribute('href', 'https://example.com/post');
        expect(title).not.toHaveAttribute('target');
        expect(title).not.toHaveAttribute('rel');
        expect(title.textContent).toBe('A story ');
        expect(container.querySelector('.domain')).toHaveTextContent('(example.com)');
    });

    it('keeps the raw url as href (no URL normalisation)', () => {
        const { container } = renderItem({ url: 'https://x.com' });
        expect(container.querySelector('a.title')).toHaveAttribute('href', 'https://x.com');
    });

    it('opens external titles in a new tab when openLinkInNewTab is set', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        const { container } = renderItem();
        const title = container.querySelector('a.title')!;
        expect(title).toHaveAttribute('target', '_blank');
        expect(title).toHaveAttribute('rel', 'noopener');
    });

    it.each(['item?id=101', 'javascript:alert(1)', '//evil.example', ''])(
        'links the title to /item/:id when url is %j',
        (url) => {
            const { container } = renderItem({ url, domain: undefined });
            const title = container.querySelector('a.title')!;
            expect(title).toHaveAttribute('href', '/item/101');
            expect(title).not.toHaveAttribute('target');
            expect(container.querySelector('.domain')).toBeNull();
        }
    );

    it('does not open internal titles in a new tab', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        const { container } = renderItem({ url: 'item?id=101' });
        expect(container.querySelector('a.title')).not.toHaveAttribute('target');
    });

    it('hides the domain when the API sends none', () => {
        const { container } = renderItem({ domain: undefined });
        expect(container.querySelector('.domain')).toBeNull();
    });

    it('applies titleFontSize and listSpacing from settings', () => {
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '12');
        const { container } = renderItem();
        expect(container.querySelector('a.title')).toHaveStyle({ fontSize: '20px' });
        expect(container.querySelector('.item-block > div')).toHaveStyle({ marginBottom: '12px' });
    });

    it('uses the default 16px title and 0px spacing', () => {
        const { container } = renderItem();
        expect(container.querySelector('a.title')).toHaveStyle({ fontSize: '16px' });
        expect(container.querySelector('.item-block > div')).toHaveStyle({ marginBottom: '0px' });
    });

    it('renders the laptop subtext: points, user, time and comments', () => {
        const { container } = renderItem();
        const subtext = laptop(container);
        expect(subtext).toHaveTextContent('42 points by pg 3 hours ago | 5 comments');
        expect(within(subtext).getByRole('link', { name: 'pg' })).toHaveAttribute('href', '/user/pg');
        expect(within(subtext).getByRole('link', { name: '5 comments' })).toHaveAttribute('href', '/item/101');
        expect(subtext.querySelector('.item-details')).not.toBeNull();
    });

    it('renders the mobile subtext: user, points ★, time and comment link', () => {
        const { container } = renderItem();
        const subtext = palm(container);
        expect(within(subtext).getByRole('link', { name: 'pg' })).toHaveAttribute('href', '/user/pg');
        expect(subtext.querySelector('.right')).toHaveTextContent('42 ★');
        const comments = subtext.querySelector('a.comment-number')!;
        expect(comments).toHaveAttribute('href', '/item/101');
        expect(comments).toHaveTextContent('• 5 comments');
        expect(subtext).toHaveTextContent('3 hours ago • 5 comments');
    });

    it.each([
        [0, 'discuss'],
        [1, '1 comment'],
        [7, '7 comments'],
    ])('formats %i comments as %j', (count, label) => {
        const { container } = renderItem({ comments_count: count });
        expect(within(laptop(container)).getByRole('link', { name: label })).toBeInTheDocument();
    });

    it('shows only the time for jobs (no points, user or comments)', () => {
        const { container } = renderItem({ type: 'job', points: 0, user: '', comments_count: 0 });
        expect(laptop(container)).toHaveTextContent(/^3 hours ago$/);
        expect(laptop(container).querySelector('.item-details')).toBeNull();
        expect(palm(container)).toHaveTextContent(/^3 hours ago$/);
        expect(container.querySelector('.details .name')).toBeNull();
        expect(container.querySelector('.comment-number')).toBeNull();
        expect(screen.queryByText(/points by/)).toBeNull();
        expect(screen.queryByText(/★/)).toBeNull();
    });

    it('navigates to the user and item pages', async () => {
        const { container, user } = renderItem();
        await user.click(within(laptop(container)).getByRole('link', { name: 'pg' }));
        expect(screen.getByText('user page')).toBeInTheDocument();
    });

    it('navigates to the item page from the comments link', async () => {
        const { container, user } = renderItem();
        await user.click(within(laptop(container)).getByRole('link', { name: '5 comments' }));
        expect(screen.getByText('item page')).toBeInTheDocument();
    });
});
