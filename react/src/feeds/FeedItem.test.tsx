import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { makeStory } from '../test/feedStories';
import { renderWithProviders } from '../test/renderWithProviders';
import type { Story } from '../shared/models';
import { FeedItem } from './FeedItem';

function renderItem(item: Story) {
    const result = renderWithProviders(
        <Routes>
            <Route path="*" element={<FeedItem item={item} />} />
        </Routes>
    );
    const root = result.container.querySelector<HTMLElement>('.feed-item')!;
    return {
        ...result,
        root,
        title: root.querySelector<HTMLAnchorElement>('a.title')!,
        palm: root.querySelector<HTMLElement>('.subtext-palm')!,
        laptop: root.querySelector<HTMLElement>('.subtext-laptop')!,
    };
}

describe('FeedItem', () => {
    it('renders an external story link with its domain', () => {
        const { title, root } = renderItem(makeStory(7, { url: 'https://example.com/a', domain: 'example.com' }));
        expect(title).toHaveTextContent('Story 7');
        expect(title).toHaveAttribute('href', 'https://example.com/a');
        expect(title).not.toHaveAttribute('target');
        expect(title).not.toHaveAttribute('rel');
        expect(root.querySelector('.domain')).toHaveTextContent('(example.com)');
        expect(root.querySelector('p')).toHaveTextContent('Story 7 (example.com)');
    });

    it('omits the domain span when the API gives none', () => {
        const { root } = renderItem(makeStory(7, { domain: undefined }));
        expect(root.querySelector('.domain')).toBeNull();
    });

    it.each([
        ['relative', 'item?id=8'],
        ['missing', undefined],
    ])('links the title to the item page when the url is %s', async (_label, url) => {
        const { title } = renderItem(makeStory(8, { url, domain: undefined, type: 'ask' }));
        expect(title).toHaveAttribute('href', '/item/8');
        await userEvent.click(title);
        expect(screen.getByTestId('location')).toHaveTextContent('/item/8');
    });

    it('renders mobile and laptop subtext with user, points, time and comment links', () => {
        const { palm, laptop } = renderItem(makeStory(3, { points: 42, user: 'pg', comments_count: 5 }));

        expect(within(palm).getByRole('link', { name: 'pg' })).toHaveAttribute('href', '/user/pg');
        expect(palm.querySelector('.right')).toHaveTextContent('42 ★');
        expect(palm).toHaveTextContent('3 hours ago');
        const palmComments = palm.querySelector('a.comment-number')!;
        expect(palmComments).toHaveAttribute('href', '/item/3');
        expect(palmComments).toHaveTextContent('• 5 comments');

        expect(laptop).toHaveTextContent('42 points by pg 3 hours ago | 5 comments');
        expect(within(laptop).getByRole('link', { name: 'pg' })).toHaveAttribute('href', '/user/pg');
        expect(within(laptop).getByRole('link', { name: '5 comments' })).toHaveAttribute('href', '/item/3');
        expect(laptop.querySelector('.item-details')).not.toBeNull();
    });

    it.each([
        [1, '1 comment'],
        [0, 'discuss'],
        [undefined, 'discuss'],
    ])('formats %s comments as "%s"', (count, label) => {
        const { laptop } = renderItem(makeStory(3, { comments_count: count }));
        expect(within(laptop).getByRole('link', { name: label })).toBeInTheDocument();
    });

    it('hides user, points and comments for jobs', () => {
        const { palm, laptop } = renderItem(
            makeStory(9, { type: 'job', title: 'Acme is hiring', time_ago: '1 day ago', points: 0 })
        );
        expect(within(palm).queryAllByRole('link')).toHaveLength(0);
        expect(palm.querySelector('.right')).toBeNull();
        expect(palm).toHaveTextContent(/^1 day ago$/);
        expect(within(laptop).queryAllByRole('link')).toHaveLength(0);
        expect(laptop).toHaveTextContent(/^1 day ago$/);
        expect(laptop.querySelector('.item-details')).toBeNull();
    });

    it('applies list spacing and title font size from settings', () => {
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '12');
        const { root, title } = renderItem(makeStory(1));
        expect(root).toHaveStyle({ marginBottom: '12px' });
        expect(title).toHaveStyle({ fontSize: '20px' });
    });

    it('uses default spacing and font size', () => {
        const { root, title } = renderItem(makeStory(1, { url: 'item?id=1' }));
        expect(root.style.marginBottom).toBe('0px');
        expect(title.style.fontSize).toBe('16px');
    });

    it('opens external links in a new tab when the setting is on', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        const { title } = renderItem(makeStory(1));
        expect(title).toHaveAttribute('target', '_blank');
        expect(title).toHaveAttribute('rel', 'noopener');
    });

    it('never adds target to internal title links', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        const { title } = renderItem(makeStory(1, { url: 'item?id=1' }));
        expect(title).not.toHaveAttribute('target');
    });
});
