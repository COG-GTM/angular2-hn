import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { Comment } from './Comment';
import type { Comment as CommentModel } from '../models';

function makeComment(overrides: Partial<CommentModel> = {}): CommentModel {
    return {
        id: 1,
        level: 0,
        user: 'pg',
        time: 0,
        time_ago: '1 hour ago',
        content: '<p>top level</p>',
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
    it('renders the author, time and html content', () => {
        renderComment(makeComment());

        expect(screen.getByRole('link', { name: 'pg' })).toHaveAttribute('href', '/user/pg');
        expect(screen.getByText('1 hour ago')).toBeInTheDocument();
        expect(screen.getByText('top level')).toBeInTheDocument();
    });

    it('renders nested comments recursively', () => {
        renderComment(
            makeComment({
                comments: [
                    makeComment({
                        id: 2,
                        user: 'dang',
                        content: '<p>child</p>',
                        comments: [makeComment({ id: 3, user: 'sama', content: '<p>grandchild</p>' })],
                    }),
                ],
            })
        );

        expect(screen.getByText('child')).toBeInTheDocument();
        expect(screen.getByText('grandchild')).toBeInTheDocument();
        expect(screen.getAllByRole('link')).toHaveLength(3);
    });

    it('collapses and expands the comment tree', () => {
        const { container } = renderComment(makeComment());
        const toggle = screen.getByText('[-]');

        fireEvent.click(toggle);

        expect(screen.getByText('[+]')).toBeInTheDocument();
        expect(container.querySelector('.meta-collapse')).toBeInTheDocument();
        expect(container.querySelector('.comment-tree > div')).toHaveAttribute('hidden');

        fireEvent.click(screen.getByText('[+]'));

        expect(screen.getByText('[-]')).toBeInTheDocument();
        expect(container.querySelector('.comment-tree > div')).not.toHaveAttribute('hidden');
    });

    it('renders a placeholder for deleted comments', () => {
        renderComment(makeComment({ deleted: true }));

        expect(screen.getByText('[deleted]')).toBeInTheDocument();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
});
