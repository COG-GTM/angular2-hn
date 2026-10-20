import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '../../shared/test-utils';
import { Comment } from './Comment';
import { makeComment } from './fixtures';

function toggleFor(user: string) {
    return screen.getByRole('button', { name: new RegExp(`comment by ${user}$`) });
}

describe('Comment', () => {
    it('renders the meta line (toggle, user link, time) and the sanitized comment text', () => {
        const { container } = renderWithProviders(
            <Comment
                comment={makeComment({
                    content: '<p>Hello <a href="https://x.dev">x</a></p><script>alert(1)</script>',
                })}
            />
        );

        const meta = container.querySelector('.meta')!;
        expect(meta).not.toHaveClass('meta-collapse');
        expect(meta).toHaveTextContent('[-]alice2 hours ago');
        expect(screen.getByRole('link', { name: 'alice' })).toHaveAttribute('href', '/user/alice');
        expect(container.querySelector('.time')).toHaveTextContent('2 hours ago');

        const text = container.querySelector('.comment-text')!;
        expect(text).toHaveTextContent('Hello x');
        expect(text.querySelector('script')).toBeNull();
        expect(within(text as HTMLElement).getByRole('link', { name: 'x' })).toHaveAttribute(
            'rel',
            'nofollow noopener noreferrer'
        );
    });

    it('renders nested replies recursively', () => {
        const tree = makeComment({
            comments: [
                makeComment({
                    id: 102,
                    level: 1,
                    user: 'bob',
                    content: 'reply',
                    comments: [makeComment({ id: 103, level: 2, user: 'carol', content: 'deep reply' })],
                }),
            ],
        });
        const { container } = renderWithProviders(<Comment comment={tree} />);

        expect(screen.getAllByTestId('comment')).toHaveLength(3);
        expect(container.querySelectorAll('ul.subtree')).toHaveLength(3);
        expect(screen.getByText('deep reply')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'carol' })).toHaveAttribute('href', '/user/carol');
    });

    it('collapses and expands the subtree on click', async () => {
        const tree = makeComment({ comments: [makeComment({ id: 102, user: 'bob', content: 'reply' })] });
        const { container, user } = renderWithProviders(<Comment comment={tree} />);
        const toggle = toggleFor('alice');
        const body = container.querySelector('.comment-tree > div')!;

        expect(toggle).toHaveAttribute('aria-expanded', 'true');
        expect(body).not.toHaveAttribute('hidden');

        await user.click(toggle);
        expect(toggle).toHaveTextContent('[+]');
        expect(toggle).toHaveAttribute('aria-expanded', 'false');
        expect(toggle).toHaveAccessibleName('Expand comment by alice');
        expect(container.querySelector('.meta')).toHaveClass('meta-collapse');
        expect(body).toHaveAttribute('hidden');
        expect(screen.getByText('reply')).not.toBeVisible();

        await user.click(toggle);
        expect(toggle).toHaveTextContent('[-]');
        expect(body).not.toHaveAttribute('hidden');
        expect(screen.getByText('reply')).toBeVisible();
    });

    it('toggles with Enter and Space and is focusable', async () => {
        const { user } = renderWithProviders(<Comment comment={makeComment()} />);
        const toggle = toggleFor('alice');
        expect(toggle).toHaveAttribute('tabindex', '0');

        await user.tab();
        expect(toggle).toHaveFocus();
        await user.keyboard('{Enter}');
        expect(toggle).toHaveTextContent('[+]');
        await user.keyboard(' ');
        expect(toggle).toHaveTextContent('[-]');
        fireEvent.keyDown(toggle, { key: 'a' });
        expect(toggle).toHaveTextContent('[-]');
    });

    it('collapses a nested reply independently of its parent', async () => {
        const tree = makeComment({
            comments: [
                makeComment({
                    id: 102,
                    user: 'bob',
                    content: 'reply',
                    comments: [makeComment({ id: 103, user: 'carol', content: 'deep' })],
                }),
            ],
        });
        const { user } = renderWithProviders(<Comment comment={tree} />);

        await user.click(toggleFor('bob'));
        expect(screen.getByText('reply')).not.toBeVisible();
        expect(screen.getByText('deep')).not.toBeVisible();
        expect(toggleFor('alice')).toHaveTextContent('[-]');
        expect(screen.getByRole('link', { name: 'bob' })).toBeVisible();
    });

    it('renders deleted comments as "[deleted] | Comment Deleted" without user, text or replies', () => {
        const { container } = renderWithProviders(
            <Comment
                comment={makeComment({
                    deleted: true,
                    user: 'ghost',
                    content: 'secret',
                    comments: [makeComment({ id: 2, user: 'child', content: 'child text' })],
                })}
            />
        );

        expect(container.querySelector('.deleted-meta')).toHaveTextContent('[deleted] | Comment Deleted');
        expect(container.querySelector('.deleted-meta .collapse')).toHaveTextContent('[deleted]');
        expect(screen.queryByRole('button')).toBeNull();
        expect(screen.queryByText('secret')).toBeNull();
        expect(screen.queryByText('child text')).toBeNull();
    });

    it('navigates to the user profile from the user link', async () => {
        const { user } = renderWithProviders(<Comment comment={makeComment()} />, {
            route: '/item/1',
            path: '/item/:id',
            otherRoutes: { '/user/:id': <p>user page</p> },
        });

        await user.click(screen.getByRole('link', { name: 'alice' }));
        expect(screen.getByText('user page')).toBeInTheDocument();
    });
});
