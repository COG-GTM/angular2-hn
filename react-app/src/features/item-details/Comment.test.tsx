import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { Comment as CommentModel } from '../../shared/models';
import { renderWithProviders } from '../../shared/test-utils';
import { Comment } from './Comment';

function comment(overrides: Partial<CommentModel> = {}): CommentModel {
    return {
        id: 1,
        level: 0,
        user: 'pg',
        time: 0,
        time_ago: '2 hours ago',
        content: '<p>Top level</p>',
        comments: [],
        ...overrides,
    };
}

const tree = comment({
    comments: [
        comment({
            id: 2,
            level: 1,
            user: 'dang',
            content: 'Reply',
            comments: [comment({ id: 3, level: 2, user: 'tptacek', content: 'Nested reply' })],
        }),
    ],
});

describe('Comment', () => {
    it('renders the meta line ([-], user link, time) and the sanitized content', () => {
        const { container } = renderWithProviders(
            <Comment comment={comment({ content: 'Hi<script>alert(1)</script><p>there <a href="item?id=5">x</a>' })} />
        );
        const meta = container.querySelector('.meta')!;
        expect(meta).not.toHaveClass('meta-collapse');
        expect(meta.querySelector('span.collapse')).toHaveTextContent('[-]');
        expect(within(meta as HTMLElement).getByRole('link', { name: 'pg' })).toHaveAttribute('href', '/user/pg');
        expect(meta.querySelector('.time')).toHaveTextContent('2 hours ago');
        // Angular strips the template whitespace between `[-]`, the user link and `.time`.
        expect(meta.textContent).toBe('[-]pg2 hours ago');
        const text = container.querySelector('p.comment-text')!;
        expect(text.querySelector('script')).toBeNull();
        expect(text.querySelector('a')).toHaveAttribute('href', 'https://news.ycombinator.com/item?id=5');
        expect(text.querySelector('a')).toHaveAttribute('rel', 'nofollow noopener noreferrer');
    });

    it('renders the reply tree recursively', () => {
        const { container } = renderWithProviders(<Comment comment={tree} />);
        expect(container.querySelectorAll('.app-comment')).toHaveLength(3);
        const nested = container.querySelectorAll('ul.subtree > li > .app-comment');
        expect(nested).toHaveLength(2);
        expect(screen.getByRole('link', { name: 'tptacek' })).toBeInTheDocument();
        expect(screen.getByText('Nested reply')).toBeVisible();
    });

    it('collapses and expands its subtree with a click on [-]/[+]', async () => {
        const { container, user } = renderWithProviders(<Comment comment={tree} />);
        const toggle = screen.getByRole('button', { name: 'Collapse comment by pg' });
        expect(toggle).toHaveAttribute('aria-expanded', 'true');

        await user.click(toggle);
        expect(toggle).toHaveTextContent('[+]');
        expect(toggle).toHaveAttribute('aria-expanded', 'false');
        expect(toggle).toHaveAccessibleName('Expand comment by pg');
        expect(container.querySelector('.meta')).toHaveClass('meta-collapse');
        expect(container.querySelector('.comment-tree > div')).toHaveAttribute('hidden');
        expect(screen.getByText('Top level')).not.toBeVisible();
        expect(screen.getByText('Nested reply')).not.toBeVisible();
        // The collapsed comment's own meta line stays visible.
        expect(screen.getByRole('link', { name: 'pg' })).toBeVisible();

        await user.click(toggle);
        expect(toggle).toHaveTextContent('[-]');
        expect(screen.getByText('Nested reply')).toBeVisible();
    });

    it('collapses a nested comment without touching its parent', async () => {
        const { user } = renderWithProviders(<Comment comment={tree} />);
        await user.click(screen.getByRole('button', { name: 'Collapse comment by dang' }));
        expect(screen.getByText('Top level')).toBeVisible();
        expect(screen.getByRole('link', { name: 'dang' })).toBeVisible();
        expect(screen.getByText('Reply')).not.toBeVisible();
        expect(screen.getByText('Nested reply')).not.toBeVisible();
    });

    it('toggles from the keyboard with Enter and Space', async () => {
        const { user } = renderWithProviders(<Comment comment={tree} />);
        const toggle = screen.getByRole('button', { name: 'Collapse comment by pg' });
        expect(toggle.tagName).toBe('SPAN');
        expect(toggle).toHaveAttribute('tabindex', '0');

        await user.tab();
        expect(toggle).toHaveFocus();
        await user.keyboard('{Enter}');
        expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await user.keyboard(' ');
        expect(toggle).toHaveAttribute('aria-expanded', 'true');
        await user.keyboard('a');
        expect(toggle).toHaveAttribute('aria-expanded', 'true');
    });

    it('renders deleted comments as "[deleted] | Comment Deleted" without their tree or toggle', () => {
        const { container } = renderWithProviders(
            <Comment comment={comment({ deleted: true, user: '', content: '', comments: [comment({ id: 9 })] })} />
        );
        expect(container.querySelector('.deleted-meta')).toHaveTextContent('[deleted] | Comment Deleted');
        expect(container.querySelector('.deleted-meta span.collapse')).toHaveTextContent('[deleted]');
        expect(container.querySelector('.meta')).toBeNull();
        expect(container.querySelector('.comment-tree')).toBeNull();
        expect(screen.queryByRole('button')).toBeNull();
    });

    it('renders dead comments like Angular (content as sent, toggle still works)', () => {
        const { container } = renderWithProviders(
            <Comment comment={comment({ dead: true, content: '[flagged]', comments: undefined as never })} />
        );
        expect(container.querySelector('.comment-text')).toHaveTextContent('[flagged]');
        expect(container.querySelectorAll('ul.subtree > li')).toHaveLength(0);
        expect(screen.getByRole('button', { name: 'Collapse comment by pg' })).toBeInTheDocument();
    });

    it('navigates to the commenter profile', async () => {
        const { user } = renderWithProviders(<Comment comment={comment()} />, {
            otherRoutes: { '/user/:id': <p>user page</p> },
        });
        await user.click(screen.getByRole('link', { name: 'pg' }));
        expect(screen.getByText('user page')).toBeInTheDocument();
    });
});
