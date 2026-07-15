import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Comment from './Comment';
import { Comment as CommentModel } from '../models';

function makeComment(overrides: Partial<CommentModel> = {}): CommentModel {
    return {
        id: 1,
        level: 0,
        user: 'alice',
        time: 0,
        time_ago: '1 hour ago',
        content: '<p>hello world</p>',
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
    it('renders meta, user link, time and HTML content', () => {
        const { container } = renderComment(makeComment());

        const userLink = screen.getByRole('link', { name: 'alice' });
        expect(userLink).toHaveAttribute('href', '/user/alice');
        expect(screen.getByText('1 hour ago')).toBeInTheDocument();
        expect(container.querySelector('.comment-text')?.innerHTML).toBe('<p>hello world</p>');
        expect(screen.getByText('[-]')).toBeInTheDocument();
    });

    it('recursively renders nested child comments', () => {
        const comment = makeComment({
            comments: [
                makeComment({ id: 2, user: 'bob', content: '<p>child</p>' }),
                makeComment({
                    id: 3,
                    user: 'carol',
                    content: '<p>child2</p>',
                    comments: [makeComment({ id: 4, user: 'dave', content: '<p>grandchild</p>' })],
                }),
            ],
        });
        const { container } = renderComment(comment);

        expect(screen.getByRole('link', { name: 'bob' })).toHaveAttribute('href', '/user/bob');
        expect(screen.getByRole('link', { name: 'carol' })).toHaveAttribute('href', '/user/carol');
        expect(screen.getByRole('link', { name: 'dave' })).toHaveAttribute('href', '/user/dave');
        expect(container.innerHTML).toContain('grandchild');
    });

    it('toggles collapse when the [-]/[+] control is clicked', () => {
        const { container } = renderComment(makeComment());

        const meta = container.querySelector('.meta') as HTMLElement;
        const tree = container.querySelector('.comment-tree > div') as HTMLElement;

        // Expanded by default.
        expect(within(container).getByText('[-]')).toBeInTheDocument();
        expect(meta).not.toHaveClass('meta-collapse');
        expect(tree).toBeVisible();

        fireEvent.click(screen.getByText('[-]'));

        // Collapsed.
        expect(screen.getByText('[+]')).toBeInTheDocument();
        expect(meta).toHaveClass('meta-collapse');
        expect(tree).not.toBeVisible();

        fireEvent.click(screen.getByText('[+]'));
        expect(screen.getByText('[-]')).toBeInTheDocument();
        expect(meta).not.toHaveClass('meta-collapse');
    });

    it('renders the deleted block when the comment is deleted', () => {
        const { container } = renderComment(makeComment({ deleted: true }));

        expect(container.querySelector('.deleted-meta')).toBeInTheDocument();
        expect(screen.getByText('[deleted]')).toBeInTheDocument();
        expect(screen.getByText(/Comment Deleted/)).toBeInTheDocument();
        expect(container.querySelector('.comment-tree')).toBeNull();
    });
});
