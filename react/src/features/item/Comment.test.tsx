import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import type { Comment as CommentModel } from '../../shared/models';
import { Comment } from './Comment';

function makeComment(overrides: Partial<CommentModel> = {}): CommentModel {
    return {
        id: 1,
        level: 0,
        user: 'alice',
        time: 123,
        time_ago: '1 hour ago',
        content: '<strong>comment content</strong>',
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
    it('renders the author link, time, and HTML content', () => {
        renderComment(makeComment());

        expect(screen.getByRole('link', { name: 'alice' })).toHaveAttribute('href', '/user/alice');
        expect(screen.getByText('1 hour ago')).toBeInTheDocument();
        expect(document.querySelector('.comment-text strong')).toHaveTextContent('comment content');
    });

    it('collapses and re-expands the comment tree', async () => {
        const user = userEvent.setup();
        renderComment(makeComment());

        const collapse = screen.getByText('[-]');
        await user.click(collapse);

        expect(screen.getByText('[+]')).toBeInTheDocument();
        expect(document.querySelector('.meta')).toHaveClass('meta-collapse');
        expect(document.querySelector('.comment-tree > div')).toHaveAttribute('hidden');

        await user.click(screen.getByText('[+]'));

        expect(screen.getByText('[-]')).toBeInTheDocument();
        expect(document.querySelector('.meta')).not.toHaveClass('meta-collapse');
        expect(document.querySelector('.comment-tree > div')).not.toHaveAttribute('hidden');
    });

    it('renders deleted comments without content or children', () => {
        renderComment(
            makeComment({
                deleted: true,
                comments: [makeComment({ id: 2, content: 'child content' })],
            })
        );

        expect(document.querySelector('.deleted-meta')).toHaveTextContent('[deleted]');
        expect(document.querySelector('.deleted-meta')).toHaveTextContent('Comment Deleted');
        expect(document.querySelector('.comment-text')).not.toBeInTheDocument();
        expect(screen.queryByText('child content')).not.toBeInTheDocument();
    });

    it('recursively renders three levels of nested comments', () => {
        const third = makeComment({ id: 3, content: 'third level' });
        const second = makeComment({ id: 2, content: 'second level', comments: [third] });
        const first = makeComment({ content: 'first level', comments: [second] });

        renderComment(first);

        expect(screen.getByText('first level')).toBeInTheDocument();
        expect(screen.getByText('second level')).toBeInTheDocument();
        expect(screen.getByText('third level')).toBeInTheDocument();
        expect(document.querySelectorAll('.subtree li')).toHaveLength(2);
    });
});
