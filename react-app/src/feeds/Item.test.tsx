import { screen } from '@testing-library/react';

import type { Settings, Story } from '../shared/models';
import { makeStory } from '../test/fixtures';
import { renderWithProviders } from '../test/utils';
import { Item } from './Item';

function renderItem(item: Story, settings?: Partial<Settings>) {
    return renderWithProviders(<Item item={item} />, { settings });
}

describe('Item', () => {
    it('links external stories to their URL and shows the domain', () => {
        const { container } = renderItem(makeStory({ url: 'https://example.com/post', domain: 'example.com' }));
        const title = container.querySelector('a.title');
        expect(title).toHaveAttribute('href', 'https://example.com/post');
        expect(title).toHaveTextContent('Example story');
        expect(container.querySelector('span.domain')).toHaveTextContent('(example.com)');
    });

    it('links self posts to /item/:id without a domain', () => {
        const { container } = renderItem(makeStory({ id: 77, url: 'item?id=77', domain: '' }));
        expect(container.querySelector('a.title')).toHaveAttribute('href', '/item/77');
        expect(container.querySelector('.domain')).not.toBeInTheDocument();
    });

    it('opens external links in a new tab only when the setting is on', () => {
        const { container, unmount } = renderItem(makeStory(), { openLinkInNewTab: false });
        expect(container.querySelector('a.title')).not.toHaveAttribute('target');
        expect(container.querySelector('a.title')).not.toHaveAttribute('rel');
        unmount();

        const { container: c2 } = renderItem(makeStory(), { openLinkInNewTab: true });
        expect(c2.querySelector('a.title')).toHaveAttribute('target', '_blank');
        expect(c2.querySelector('a.title')).toHaveAttribute('rel', 'noopener');
    });

    it('applies title font size and list spacing settings', () => {
        const { container } = renderItem(makeStory(), { titleFontSize: '20', listSpacing: '12' });
        expect(container.querySelector('a.title')).toHaveStyle({ fontSize: '20px' });
        expect(container.querySelector('.item-block > div')).toHaveStyle({ marginBottom: '12px' });
    });

    it('applies the title font size to internal links too', () => {
        const { container } = renderItem(makeStory({ url: 'item?id=1' }), { titleFontSize: '18' });
        expect(container.querySelector('a.title')).toHaveStyle({ fontSize: '18px' });
    });

    it('renders user, points, time and comments in both subtext blocks', () => {
        const { container } = renderItem(makeStory({ id: 5, user: 'dang', points: 99, comments_count: 1 }));
        const palm = container.querySelector('.subtext-palm')!;
        expect(palm.querySelector('.name a')).toHaveAttribute('href', '/user/dang');
        expect(palm.querySelector('.right')).toHaveTextContent('99 ★');
        expect(palm).toHaveTextContent('2 hours ago');
        expect(palm.querySelector('a.comment-number')).toHaveAttribute('href', '/item/5');
        expect(palm.querySelector('a.comment-number')).toHaveTextContent('• 1 comment');

        const laptop = container.querySelector('.subtext-laptop')!;
        expect(laptop).toHaveTextContent('99 points by dang 2 hours ago | 1 comment');
        expect(laptop.querySelector('a[href="/user/dang"]')).toBeInTheDocument();
        expect(laptop.querySelector('.item-details a')).toHaveAttribute('href', '/item/5');
    });

    it.each([
        [0, 'discuss'],
        [1, '1 comment'],
        [42, '42 comments'],
    ])('formats %i comments as "%s"', (count, text) => {
        renderItem(makeStory({ comments_count: count }));
        expect(screen.getAllByRole('link', { name: new RegExp(text) })).toHaveLength(2);
    });

    it('hides user, points and comments for jobs', () => {
        const { container } = renderItem(makeStory({ type: 'job', url: 'https://jobs.example.com', user: 'pg' }));
        expect(container.querySelector('.subtext-palm .name')).not.toBeInTheDocument();
        expect(container.querySelector('.comment-number')).not.toBeInTheDocument();
        expect(container.querySelector('.item-details')).not.toBeInTheDocument();
        expect(container.querySelector('a[href^="/user/"]')).not.toBeInTheDocument();
        expect(container.querySelector('.subtext-laptop')).toHaveTextContent(/^\s*2 hours ago\s*$/);
        expect(container.querySelector('.subtext-palm')).not.toHaveTextContent('points');
    });
});
