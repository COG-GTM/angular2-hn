import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import type { Comment as CommentModel } from '../../../models/comment';
import Comment from '../Comment';

function makeComment(overrides: Partial<CommentModel> = {}): CommentModel {
    return {
        id: 1,
        level: 0,
        user: 'alice',
        time: 0,
        time_ago: '1 hour ago',
        content: '<p>parent comment</p>',
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
    it('renders nested comments recursively', () => {
        renderComment(
            makeComment({
                comments: [
                    makeComment({
                        id: 2,
                        user: 'bob',
                        content: '<p>child comment</p>',
                        comments: [makeComment({ id: 3, user: 'carol', content: '<p>grandchild comment</p>' })],
                    }),
                ],
            })
        );

        expect(screen.getByText('alice')).toBeInTheDocument();
        expect(screen.getByText('bob')).toBeInTheDocument();
        expect(screen.getByText('carol')).toBeInTheDocument();
        expect(screen.getByText('grandchild comment')).toBeInTheDocument();
    });

    it('collapses and expands the comment body', async () => {
        const user = userEvent.setup();
        const { container } = renderComment(makeComment());

        const toggle = screen.getByText('[-]');
        expect(container.querySelector('[hidden]')).toBeNull();

        await user.click(toggle);

        expect(screen.getByText('[+]')).toBeInTheDocument();
        expect(container.querySelector('[hidden]')).not.toBeNull();
        expect(container.querySelector('.meta-collapse')).not.toBeNull();

        await user.click(screen.getByText('[+]'));

        expect(screen.getByText('[-]')).toBeInTheDocument();
        expect(container.querySelector('[hidden]')).toBeNull();
    });

    it('renders the deleted branch instead of the comment body', () => {
        renderComment(makeComment({ deleted: true, content: '<p>should not show</p>' }));

        expect(screen.getByText('[deleted]')).toBeInTheDocument();
        expect(screen.getByText(/Comment Deleted/)).toBeInTheDocument();
        expect(screen.queryByText('should not show')).toBeNull();
        expect(screen.queryByText('alice')).toBeNull();
    });
});
