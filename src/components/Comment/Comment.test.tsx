import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Comment from './Comment';
import { Comment as CommentModel } from '../../models/comment';
import { renderWithProviders, stubMatchMedia } from '../../testUtils';

function makeComment(overrides: Partial<CommentModel> = {}): CommentModel {
    return {
        id: 1,
        level: 0,
        user: 'pg',
        time: 0,
        time_ago: '2 hours ago',
        content: '<p>Top level</p>',
        deleted: false,
        comments: [],
        ...overrides,
    };
}

describe('Comment', () => {
    beforeEach(() => {
        localStorage.clear();
        stubMatchMedia();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('renders the author, time and HTML content', () => {
        const { container } = renderWithProviders(<Comment comment={makeComment()} />);

        expect(screen.getByRole('link', { name: 'pg' })).toHaveAttribute('href', '/user/pg');
        expect(screen.getByText('2 hours ago')).toHaveClass('time');
        expect(container.querySelector('.comment-text')?.innerHTML).toBe('<p>Top level</p>');
    });

    it('renders nested comments recursively', () => {
        const comment = makeComment({
            comments: [
                makeComment({ id: 2, user: 'child', content: 'child comment', comments: [] }),
                makeComment({
                    id: 3,
                    user: 'other',
                    content: 'other comment',
                    comments: [makeComment({ id: 4, user: 'grandchild', content: 'deep comment', comments: [] })],
                }),
            ],
        });

        const { container } = renderWithProviders(<Comment comment={comment} />);

        expect(screen.getByRole('link', { name: 'child' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'grandchild' })).toBeInTheDocument();
        expect(container.querySelectorAll('.comment')).toHaveLength(4);
        expect(screen.getByText('deep comment')).toBeInTheDocument();
    });

    it('is expanded by default and collapses its subtree when toggled', async () => {
        const comment = makeComment({ comments: [makeComment({ id: 2, user: 'child', comments: [] })] });
        const { container } = renderWithProviders(<Comment comment={comment} />);

        const toggle = screen.getAllByText('[-]')[0];
        const body = container.querySelector('.comment-tree > div');
        expect(body).not.toHaveAttribute('hidden');
        expect(container.querySelector('.meta')).not.toHaveClass('meta-collapse');

        await userEvent.click(toggle);

        expect(screen.getAllByText('[+]')[0]).toBeInTheDocument();
        expect(container.querySelector('.comment-tree > div')).toHaveAttribute('hidden');
        expect(container.querySelector('.meta')).toHaveClass('meta-collapse');

        await userEvent.click(screen.getAllByText('[+]')[0]);

        expect(container.querySelector('.comment-tree > div')).not.toHaveAttribute('hidden');
    });

    it('collapses only the clicked comment, not its children', async () => {
        const comment = makeComment({ comments: [makeComment({ id: 2, user: 'child', comments: [] })] });
        const { container } = renderWithProviders(<Comment comment={comment} />);

        await userEvent.click(screen.getAllByText('[-]')[1]);

        const [parentBody, childBody] = container.querySelectorAll('.comment-tree > div');
        expect(parentBody).not.toHaveAttribute('hidden');
        expect(childBody).toHaveAttribute('hidden');
    });

    it('renders the deleted placeholder instead of the comment body', () => {
        const { container } = renderWithProviders(
            <Comment comment={makeComment({ deleted: true, content: '<p>gone</p>' })} />
        );

        expect(screen.getByText('[deleted]')).toBeInTheDocument();
        expect(screen.getByText(/Comment Deleted/)).toBeInTheDocument();
        expect(container.querySelector('.comment-text')).not.toBeInTheDocument();
    });
});
