import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import type { Comment as CommentModel } from '../models';
import { Comment } from '.';

function makeComment(overrides: Partial<CommentModel> = {}): CommentModel {
    return {
        id: 1,
        level: 0,
        user: 'alice',
        time: 0,
        time_ago: '2 hours ago',
        content: '<p>root comment</p>',
        deleted: false,
        comments: [],
        ...overrides,
    };
}

function renderComment(comment: CommentModel) {
    return render(
        <MemoryRouter>
            <Comment comment={comment} />
        </MemoryRouter>
    );
}

describe('Comment', () => {
    it('renders a comment with no children', () => {
        const { container } = renderComment(makeComment());
        expect(screen.getByText('[-]')).toHaveClass('collapse');
        expect(screen.getByText('alice')).toHaveAttribute('href', '/user/alice');
        expect(screen.getByText('2 hours ago')).toHaveClass('time');
        expect(container.querySelector('.comment-text')?.innerHTML).toBe('<p>root comment</p>');
        expect(container.querySelector('.subtree')?.children).toHaveLength(0);
        expect(container.querySelector('.meta')).not.toHaveClass('meta-collapse');
    });

    it('renders a nested three-level tree recursively', () => {
        const tree = makeComment({
            comments: [
                makeComment({
                    id: 2,
                    user: 'bob',
                    content: 'level two',
                    comments: [makeComment({ id: 3, user: 'carol', content: 'level three' })],
                }),
            ],
        });
        const { container } = renderComment(tree);
        expect(screen.getByText('level two')).toBeInTheDocument();
        expect(screen.getByText('level three')).toBeInTheDocument();
        expect(container.querySelectorAll('.comment-text')).toHaveLength(3);
        expect(container.querySelector('.subtree .subtree .comment-text')?.textContent).toBe('level three');
        expect(screen.getByText('carol')).toHaveAttribute('href', '/user/carol');
    });

    it('collapses and expands the subtree via the [-]/[+] control', async () => {
        const user = userEvent.setup();
        const tree = makeComment({ comments: [makeComment({ id: 2, user: 'bob', content: 'child' })] });
        const { container } = renderComment(tree);
        const commentTree = container.querySelector('.comment-tree > div') as HTMLElement;
        expect(commentTree).not.toHaveAttribute('hidden');

        await user.click(screen.getAllByText('[-]')[0]);
        expect(screen.getByText('[+]')).toBeInTheDocument();
        expect(commentTree).toHaveAttribute('hidden');
        expect(container.querySelector('.meta')).toHaveClass('meta-collapse');
        expect(screen.getByText('child')).not.toBeVisible();

        await user.click(screen.getByText('[+]'));
        expect(screen.queryByText('[+]')).toBeNull();
        expect(commentTree).not.toHaveAttribute('hidden');
        expect(container.querySelector('.meta')).not.toHaveClass('meta-collapse');
        expect(screen.getByText('child')).toBeVisible();
    });

    it('renders the deleted markup for a deleted comment', () => {
        const { container } = renderComment(makeComment({ deleted: true, user: 'ghost' }));
        expect(container.querySelector('.deleted-meta')).toHaveTextContent('[deleted] | Comment Deleted');
        expect(screen.getByText('[deleted]')).toHaveClass('collapse');
        expect(screen.queryByText('ghost')).toBeNull();
        expect(container.querySelector('.comment-text')).toBeNull();
    });
});
