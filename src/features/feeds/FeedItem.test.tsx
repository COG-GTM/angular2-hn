import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '../../shared/test-utils';
import { FeedItem } from './FeedItem';
import { makeStory } from './fixtures';

function palm(container: HTMLElement) {
    return within(container.querySelector<HTMLElement>('.subtext-palm')!);
}

function laptop(container: HTMLElement) {
    return container.querySelector<HTMLElement>('.subtext-laptop')!;
}

describe('FeedItem', () => {
    it('links the title to the external url and shows the domain', () => {
        const { container } = renderWithProviders(<FeedItem item={makeStory({ id: 7, title: 'Hello HN' })} />);
        const title = screen.getByRole('link', { name: 'Hello HN' });
        expect(title).toHaveAttribute('href', 'https://example.com/7');
        expect(title).toHaveClass('title');
        expect(title).not.toHaveAttribute('target');
        expect(title).not.toHaveAttribute('rel');
        expect(container.querySelector('.domain')).toHaveTextContent('(example.com)');
        expect(title.parentElement).toHaveTextContent('Hello HN (example.com)');
    });

    it('omits the domain when the story has none', () => {
        const { container } = renderWithProviders(<FeedItem item={makeStory({ domain: undefined })} />);
        expect(container.querySelector('.domain')).toBeNull();
    });

    it('opens external links in a new tab when openLinkInNewTab is set', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        renderWithProviders(<FeedItem item={makeStory({ title: 'New tab' })} />);
        const title = screen.getByRole('link', { name: 'New tab' });
        expect(title).toHaveAttribute('target', '_blank');
        expect(title).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('links Ask/text posts (relative url) to the item page', async () => {
        const item = makeStory({ id: 99, title: 'Ask HN: Why?', type: 'ask', url: 'item?id=99', domain: undefined });
        const { user } = renderWithProviders(<FeedItem item={item} />, {
            route: '/ask/1',
            path: '/ask/:page',
            otherRoutes: { '/item/:id': <p>item page</p> },
        });
        const title = screen.getByRole('link', { name: 'Ask HN: Why?' });
        expect(title).toHaveAttribute('href', '/item/99');
        await user.click(title);
        expect(screen.getByText('item page')).toBeInTheDocument();
    });

    it('treats a missing url like a text post instead of crashing', () => {
        const item = makeStory({ id: 5, title: 'No url', url: undefined as unknown as string });
        renderWithProviders(<FeedItem item={item} />);
        expect(screen.getByRole('link', { name: 'No url' })).toHaveAttribute('href', '/item/5');
    });

    it('renders points, user, age and comments in the phone and laptop subtexts', () => {
        const { container } = renderWithProviders(
            <FeedItem item={makeStory({ id: 3, points: 120, user: 'dang', comments_count: 12 })} />
        );
        const phone = palm(container);
        expect(phone.getByRole('link', { name: 'dang' })).toHaveAttribute('href', '/user/dang');
        expect(container.querySelector('.subtext-palm .right')).toHaveTextContent('120 ★');
        expect(phone.getByRole('link', { name: '• 12 comments' })).toHaveAttribute('href', '/item/3');
        expect(container.querySelectorAll('.subtext-palm .details')[1]).toHaveTextContent('3 hours ago • 12 comments');

        const desk = laptop(container);
        expect(desk).toHaveTextContent('120 points by dang3 hours ago | 12 comments');
        expect(within(desk).getByRole('link', { name: 'dang' })).toHaveAttribute('href', '/user/dang');
        expect(within(desk).getByRole('link', { name: '12 comments' })).toHaveAttribute('href', '/item/3');
        expect(desk.querySelector('.item-details')).toHaveTextContent('3 hours ago | 12 comments');
    });

    it.each([
        [0, 'discuss'],
        [1, '1 comment'],
        [2, '2 comments'],
    ])('labels %i comments as "%s"', (count, label) => {
        const { container } = renderWithProviders(<FeedItem item={makeStory({ comments_count: count })} />);
        expect(within(laptop(container)).getByRole('link', { name: label })).toBeInTheDocument();
    });

    it('renders job items without points, user or comments', () => {
        const job = makeStory({ id: 8, type: 'job', title: 'Acme is hiring', points: null as unknown as number });
        const { container } = renderWithProviders(<FeedItem item={job} />);
        expect(screen.getAllByRole('link')).toHaveLength(1);
        expect(screen.getByRole('link', { name: 'Acme is hiring' })).toBeInTheDocument();
        expect(container.querySelectorAll('.subtext-palm .details')).toHaveLength(1);
        expect(container.querySelector('.subtext-palm')).toHaveTextContent(/^3 hours ago$/);
        expect(laptop(container)).toHaveTextContent(/^3 hours ago$/);
        expect(container.querySelector('.item-details')).toBeNull();
        expect(container).not.toHaveTextContent('points');
    });

    it('applies titleFontSize to the title and listSpacing as margin-bottom', () => {
        localStorage.setItem('titleFontSize', '22');
        localStorage.setItem('listSpacing', '12');
        renderWithProviders(<FeedItem item={makeStory({ title: 'Big' })} />);
        expect(screen.getByRole('link', { name: 'Big' })).toHaveStyle({ fontSize: '22px' });
        expect(screen.getByTestId('feed-item').firstElementChild).toHaveStyle({ marginBottom: '12px' });
    });

    it('applies titleFontSize to internal (Ask) titles too', () => {
        localStorage.setItem('titleFontSize', '20');
        renderWithProviders(<FeedItem item={makeStory({ title: 'Ask', url: 'item?id=1' })} />);
        expect(screen.getByRole('link', { name: 'Ask' })).toHaveStyle({ fontSize: '20px' });
    });

    it('uses the default 16px title and 0px spacing', () => {
        renderWithProviders(<FeedItem item={makeStory({ title: 'Default' })} />);
        expect(screen.getByRole('link', { name: 'Default' })).toHaveStyle({ fontSize: '16px' });
        expect(screen.getByTestId('feed-item').firstElementChild).toHaveStyle({ marginBottom: '0px' });
    });
});
