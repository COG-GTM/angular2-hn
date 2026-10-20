import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type { Comment as CommentModel } from '../shared/models';
import { Comment } from './Comment';

function makeComment(overrides: Partial<CommentModel> = {}): CommentModel {
    return {
        id: 1,
        level: 0,
        user: 'alice',
        time: 1700000000,
        time_ago: '2 hours ago',
        content: '<p>Hello <a href="https://example.com">world</a></p>',
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
    it('renders the meta line, user link and injected HTML body', () => {
        const { container } = renderComment(makeComment());

        expect(screen.getByRole('link', { name: 'alice' })).toHaveAttribute('href', '/user/alice');
        expect(screen.getByText('2 hours ago')).toHaveClass('time');
        expect(screen.getByText('[-]')).toHaveClass('collapse');
        expect(screen.getByRole('link', { name: 'world' })).toHaveAttribute('href', 'https://example.com');
        expect(container.querySelector('.comment-text')?.innerHTML).toContain('<p>Hello');
    });

    it('sanitizes injected comment HTML like Angular [innerHTML] did', () => {
        const { container } = renderComment(
            makeComment({
                content: '<p>Hi <img src="x" onerror="alert(1)"><a href="javascript:alert(1)">x</a></p><script>alert(1)</script>',
            })
        );

        expect(container.querySelector('.comment-text')?.innerHTML).toBe('<p>Hi <img src="x"><a>x</a></p>');
    });

    it('renders nested comments recursively inside ul.subtree', () => {
        const { container } = renderComment(
            makeComment({
                comments: [
                    makeComment({
                        id: 2,
                        level: 1,
                        user: 'bob',
                        content: 'reply',
                        comments: [makeComment({ id: 3, level: 2, user: 'carol', content: 'deep reply' })],
                    }),
                ],
            })
        );

        expect(screen.getByRole('link', { name: 'bob' })).toHaveAttribute('href', '/user/bob');
        expect(screen.getByText('deep reply')).toBeInTheDocument();
        expect(container.querySelectorAll('.app-comment')).toHaveLength(3);
        expect(container.querySelectorAll('ul.subtree > li')).toHaveLength(2);
        expect(container.querySelector('.app-comment .subtree .app-comment .subtree .app-comment')).not.toBeNull();
    });

    it('collapses and expands the body and sub-tree via the [-]/[+] toggle', () => {
        const { container } = renderComment(
            makeComment({ comments: [makeComment({ id: 2, user: 'bob', content: 'reply' })] })
        );

        const toggle = screen.getAllByText('[-]')[0];
        const hiddenWrapper = container.querySelector('.comment-tree > div') as HTMLElement;
        expect(hiddenWrapper).not.toHaveAttribute('hidden');
        expect(container.querySelector('.meta')).not.toHaveClass('meta-collapse');

        fireEvent.click(toggle);

        expect(screen.getByText('[+]')).toBeInTheDocument();
        expect(hiddenWrapper).toHaveAttribute('hidden');
        expect(container.querySelector('.meta')).toHaveClass('meta-collapse');
        // sub-tree stays in the DOM (Angular used [hidden]) but is hidden with its parent
        expect(screen.getByText('reply')).toBeInTheDocument();

        fireEvent.click(screen.getByText('[+]'));

        expect(screen.getAllByText('[-]')).toHaveLength(2);
        expect(hiddenWrapper).not.toHaveAttribute('hidden');
    });

    it('keeps collapse state local to each comment', () => {
        renderComment(makeComment({ comments: [makeComment({ id: 2, user: 'bob', content: 'reply' })] }));

        const toggles = screen.getAllByText('[-]');
        fireEvent.click(toggles[1]);

        expect(screen.getAllByText('[-]')).toHaveLength(1);
        expect(screen.getByText('[+]')).toBeInTheDocument();
    });

    it('renders the [deleted] placeholder for deleted comments', () => {
        const { container } = renderComment(
            makeComment({ deleted: true, user: '', content: '', comments: [makeComment({ id: 2, user: 'bob' })] })
        );

        expect(screen.getByText('[deleted]')).toHaveClass('collapse');
        expect(container.querySelector('.deleted-meta')?.textContent).toContain('| Comment Deleted');
        expect(container.querySelector('.meta')).toBeNull();
        expect(screen.queryByRole('link', { name: 'bob' })).toBeNull();
    });
});
