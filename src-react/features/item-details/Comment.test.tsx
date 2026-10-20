import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { Comment as CommentModel } from '../../shared/models';
import { renderWithProviders } from '../../shared/test-utils';
import { Comment } from './Comment';

function comment(overrides: Partial<CommentModel> = {}): CommentModel {
    return {
        id: 1,
        level: 0,
        user: 'alice',
        time: 0,
        time_ago: '2 hours ago',
        content: 'Parent text',
        comments: [],
        ...overrides,
    };
}

const tree = comment({
    comments: [
        comment({
            id: 2,
            level: 1,
            user: 'bob',
            content: 'Child text',
            comments: [comment({ id: 3, level: 2, user: 'carol', content: 'Grandchild text' })],
        }),
        comment({ id: 4, level: 1, user: 'dave', content: 'Second child' }),
    ],
});

describe('Comment', () => {
    it('renders the meta row and nested comments recursively', () => {
        const { container } = renderWithProviders(<Comment comment={tree} />);
        expect(container.querySelectorAll('.comment')).toHaveLength(4);
        expect(container.querySelector('.comment .subtree .comment .subtree .comment')).toHaveTextContent(
            'Grandchild text'
        );
        for (const user of ['alice', 'bob', 'carol', 'dave']) {
            expect(screen.getByRole('link', { name: user })).toHaveAttribute('href', `/user/${user}`);
        }
        const meta = container.querySelector('.meta') as HTMLElement;
        expect(meta).toHaveTextContent('[-]alice2 hours ago');
        expect(meta.querySelector('.time')).toHaveTextContent('2 hours ago');
    });

    it('collapses and expands the subtree with the [-]/[+] toggle', async () => {
        const { user, container } = renderWithProviders(<Comment comment={tree} />);
        const toggle = screen.getByRole('button', { name: 'Collapse comment by alice' });
        expect(toggle).toHaveTextContent('[-]');
        expect(toggle).toHaveAttribute('aria-expanded', 'true');

        await user.click(toggle);
        expect(toggle).toHaveTextContent('[+]');
        expect(toggle).toHaveAttribute('aria-expanded', 'false');
        expect(toggle).toHaveAccessibleName('Expand comment by alice');
        expect(container.querySelector('.meta')).toHaveClass('meta-collapse');
        expect(screen.getByText('Parent text')).not.toBeVisible();
        expect(screen.getByText('Grandchild text')).not.toBeVisible();
        // The collapsed comment keeps its own meta row visible.
        expect(screen.getByRole('link', { name: 'alice' })).toBeVisible();

        await user.click(toggle);
        expect(toggle).toHaveTextContent('[-]');
        expect(container.querySelector('.meta')).not.toHaveClass('meta-collapse');
        expect(screen.getByText('Grandchild text')).toBeVisible();
    });

    it('toggles nested comments independently and from the keyboard', async () => {
        const { user } = renderWithProviders(<Comment comment={tree} />);
        const childToggle = screen.getByRole('button', { name: 'Collapse comment by bob' });
        childToggle.focus();
        await user.keyboard('{Enter}');
        expect(childToggle).toHaveTextContent('[+]');
        expect(screen.getByText('Grandchild text')).not.toBeVisible();
        expect(screen.getByText('Parent text')).toBeVisible();
        expect(screen.getByText('Second child')).toBeVisible();

        await user.keyboard(' ');
        expect(childToggle).toHaveTextContent('[-]');
        expect(screen.getByText('Grandchild text')).toBeVisible();
    });

    it('renders deleted comments without their meta, text or children', () => {
        const { container } = renderWithProviders(
            <Comment comment={comment({ deleted: true, content: 'gone', comments: [comment({ id: 9 })] })} />
        );
        expect(container.querySelector('.deleted-meta')).toHaveTextContent('[deleted] | Comment Deleted');
        expect(screen.queryByText('gone')).not.toBeInTheDocument();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
        expect(container.querySelectorAll('.comment')).toHaveLength(1);
    });

    it('sanitizes comment HTML', () => {
        const { container } = renderWithProviders(
            <Comment
                comment={comment({
                    content:
                        'Safe <i>italic</i><p>Para <a href="https://example.com" target="_top" onclick="x()">link</a>' +
                        ' <a href="javascript:alert(1)">bad</a></p><script>window.evil = 1</script>' +
                        '<img src="x" onerror="alert(1)"><iframe src="https://evil"></iframe>',
                })}
            />
        );
        const text = container.querySelector('.comment-text') as HTMLElement;
        expect(text.querySelector('i')).toHaveTextContent('italic');
        expect(text.querySelector('script, img, iframe')).toBeNull();
        const [safe, bad] = Array.from(text.querySelectorAll('a'));
        expect(safe).toHaveAttribute('href', 'https://example.com');
        expect(safe).toHaveAttribute('rel', 'nofollow noopener noreferrer');
        expect(safe).not.toHaveAttribute('onclick');
        expect(safe).not.toHaveAttribute('target');
        expect(bad).not.toHaveAttribute('href');
    });
});
