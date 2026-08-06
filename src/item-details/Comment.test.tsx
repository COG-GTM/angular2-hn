import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { Comment as CommentModel } from '../models/comment';
import { Comment } from './Comment';

function buildComment(overrides: Partial<CommentModel> = {}): CommentModel {
    return {
        id: 1,
        level: 0,
        user: 'kate',
        time: 1500000000,
        time_ago: '2 hours ago',
        content: '<p>Top level comment</p>',
        comments: [],
        ...overrides,
    };
}

function renderComment(comment: CommentModel) {
    return render(
        <MemoryRouter>
            <ul className="comment-list">
                <li>
                    <Comment comment={comment} />
                </li>
            </ul>
        </MemoryRouter>
    );
}

describe('Comment', () => {
    it('renders the meta line, the user link and the html content', () => {
        const { container } = renderComment(buildComment());

        expect(screen.getByText('[-]')).toHaveClass('collapse');
        expect(screen.getByRole('link', { name: 'kate' })).toHaveAttribute('href', '/user/kate');
        expect(screen.getByText('2 hours ago')).toHaveClass('time');

        const commentText = container.querySelector('.comment-tree .comment-text');
        expect(commentText).not.toBeNull();
        expect(commentText?.innerHTML).toBe('<p>Top level comment</p>');
        expect(container.querySelector('.meta')).not.toHaveClass('meta-collapse');
    });

    it('renders nested comments recursively', () => {
        const comment = buildComment({
            content: 'level one',
            comments: [
                buildComment({
                    id: 2,
                    level: 1,
                    user: 'bob',
                    content: 'level two',
                    comments: [buildComment({ id: 3, level: 2, user: 'carol', content: 'level three' })],
                }),
            ],
        });

        const { container } = renderComment(comment);

        expect(screen.getByText('level one')).toBeInTheDocument();
        expect(screen.getByText('level two')).toBeInTheDocument();
        expect(screen.getByText('level three')).toBeInTheDocument();
        expect(container.querySelectorAll('.subtree')).toHaveLength(3);

        const firstSubtree = container.querySelector('.subtree');
        expect(within(firstSubtree as HTMLElement).getByRole('link', { name: 'bob' })).toBeInTheDocument();
        expect(within(firstSubtree as HTMLElement).getByRole('link', { name: 'carol' })).toBeInTheDocument();
    });

    it('collapses and expands the comment content and its children', async () => {
        const user = userEvent.setup();
        const comment = buildComment({
            content: 'parent',
            comments: [buildComment({ id: 2, user: 'bob', content: 'child' })],
        });

        const { container } = renderComment(comment);

        expect(screen.getByText('parent')).toBeVisible();
        expect(screen.getByText('child')).toBeVisible();

        await user.click(screen.getAllByText('[-]')[0]);

        expect(screen.getByText('[+]')).toBeInTheDocument();
        expect(container.querySelector('.meta')).toHaveClass('meta-collapse');
        expect(screen.getByText('parent')).not.toBeVisible();
        expect(screen.getByText('child')).not.toBeVisible();
        expect(screen.getByRole('link', { name: 'kate' })).toBeVisible();

        await user.click(screen.getByText('[+]'));

        expect(screen.getAllByText('[-]')[0]).toBeInTheDocument();
        expect(container.querySelector('.meta')).not.toHaveClass('meta-collapse');
        expect(screen.getByText('parent')).toBeVisible();
    });

    it('collapses a child independently of its parent', async () => {
        const user = userEvent.setup();
        const comment = buildComment({
            content: 'parent',
            comments: [buildComment({ id: 2, user: 'bob', content: 'child' })],
        });

        renderComment(comment);

        await user.click(screen.getAllByText('[-]')[1]);

        expect(screen.getByText('parent')).toBeVisible();
        expect(screen.getByText('child')).not.toBeVisible();
    });

    it('renders the deleted state instead of the comment body', () => {
        const { container } = renderComment(
            buildComment({ deleted: true, content: 'should not be rendered', user: 'ghost' })
        );

        expect(screen.getByText('[deleted]')).toHaveClass('collapse');
        expect(container.querySelector('.deleted-meta')?.textContent).toBe('[deleted] | Comment Deleted');
        expect(screen.queryByText('should not be rendered')).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'ghost' })).not.toBeInTheDocument();
        expect(container.querySelector('.comment-tree')).toBeNull();
    });

    it('renders deleted children inside a live comment tree', () => {
        const comment = buildComment({
            content: 'parent',
            comments: [buildComment({ id: 2, user: 'ghost', deleted: true, content: 'hidden' })],
        });

        renderComment(comment);

        expect(screen.getByText('parent')).toBeInTheDocument();
        expect(screen.getByText('[deleted]')).toBeInTheDocument();
        expect(screen.queryByText('hidden')).not.toBeInTheDocument();
    });
});
