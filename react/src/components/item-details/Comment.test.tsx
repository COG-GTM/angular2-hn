import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import type { Comment as CommentModel } from '../../models';
import { Comment } from './Comment';

function makeComment(overrides: Partial<CommentModel> = {}): CommentModel {
    return {
        id: 1,
        level: 0,
        user: 'pg',
        time: 1600000000,
        time_ago: '2 hours ago',
        content: '<p>Hello <a href="https://example.com">world</a></p>',
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
    it('renders the meta line, the comment HTML and a link to the author', () => {
        const { container } = renderComment(makeComment());

        expect(container.querySelector('.meta')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'pg' })).toHaveAttribute('href', '/user/pg');
        expect(screen.getByText('2 hours ago')).toHaveClass('time');

        const text = container.querySelector('.comment-text');
        expect(text?.innerHTML).toBe('<p>Hello <a href="https://example.com">world</a></p>');
    });

    it('starts expanded with a [-] toggle, as the Angular component initialised collapse to false', () => {
        const { container } = renderComment(makeComment());

        expect(screen.getByText('[-]')).toHaveClass('collapse');
        expect(container.querySelector('.comment-tree > div')).not.toHaveAttribute('hidden');
        expect(container.querySelector('.meta-collapse')).not.toBeInTheDocument();
    });

    it('collapses and expands the subtree when the toggle is clicked', async () => {
        const user = userEvent.setup();
        const { container } = renderComment(makeComment());

        await user.click(screen.getByText('[-]'));

        expect(screen.getByText('[+]')).toBeInTheDocument();
        expect(container.querySelector('.comment-tree > div')).toHaveAttribute('hidden');
        expect(container.querySelector('.meta')).toHaveClass('meta-collapse');

        await user.click(screen.getByText('[+]'));

        expect(screen.getByText('[-]')).toBeInTheDocument();
        expect(container.querySelector('.comment-tree > div')).not.toHaveAttribute('hidden');
        expect(container.querySelector('.meta')).not.toHaveClass('meta-collapse');
    });

    it('recurses into child comments', () => {
        const comment = makeComment({
            comments: [
                makeComment({ id: 2, user: 'dang', content: '<p>Reply</p>' }),
                makeComment({ id: 3, user: 'sama', content: '<p>Another</p>' }),
            ],
        });

        const { container } = renderComment(comment);

        expect(container.querySelectorAll('.subtree > li')).toHaveLength(2);
        expect(screen.getByRole('link', { name: 'dang' })).toHaveAttribute('href', '/user/dang');
        expect(screen.getByText('Reply')).toBeInTheDocument();
        expect(screen.getByText('Another')).toBeInTheDocument();
    });

    it('renders only the deleted notice for a deleted comment', () => {
        const { container } = renderComment(makeComment({ deleted: true }));

        expect(container.querySelector('.deleted-meta')).toHaveTextContent('[deleted] | Comment Deleted');
        expect(container.querySelector('.meta')).not.toBeInTheDocument();
        expect(container.querySelector('.comment-text')).not.toBeInTheDocument();
    });
});
