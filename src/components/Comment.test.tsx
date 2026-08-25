import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import type { Comment as CommentModel } from '../models/comment';
import Comment from './Comment';

function makeComment(overrides: Partial<CommentModel> = {}): CommentModel {
    return {
        id: 1,
        level: 0,
        user: 'pg',
        time: 0,
        time_ago: '1 hour ago',
        content: '<p>Top level</p>',
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

afterEach(cleanup);

describe('Comment', () => {
    it('renders the comment html and author link', () => {
        const { container } = renderComment(makeComment());

        expect(container.querySelector('.comment-text')?.innerHTML).toBe('<p>Top level</p>');
        expect(screen.getByRole('link', { name: 'pg' }).getAttribute('href')).toBe('/user/pg');
    });

    it('renders nested comments recursively', () => {
        renderComment(
            makeComment({
                comments: [
                    makeComment({ id: 2, user: 'kid', content: 'Reply', comments: [makeComment({ id: 3, user: 'grandkid', content: 'Deep reply' })] }),
                ],
            })
        );

        expect(screen.getByText('Reply')).toBeTruthy();
        expect(screen.getByText('Deep reply')).toBeTruthy();
        expect(screen.getByRole('link', { name: 'grandkid' })).toBeTruthy();
    });

    it('collapses and expands its subtree', () => {
        const { container } = renderComment(makeComment({ comments: [makeComment({ id: 2, content: 'Reply' })] }));
        const toggle = screen.getAllByText('[-]')[0];
        const tree = container.querySelector<HTMLElement>('.comment-tree > div');

        expect(tree?.hidden).toBe(false);

        fireEvent.click(toggle);
        expect(screen.getAllByText('[+]').length).toBe(1);
        expect(container.querySelector('.meta')?.className).toContain('meta-collapse');
        expect(container.querySelector<HTMLElement>('.comment-tree > div')?.hidden).toBe(true);

        fireEvent.click(screen.getAllByText('[+]')[0]);
        expect(container.querySelector<HTMLElement>('.comment-tree > div')?.hidden).toBe(false);
    });

    it('renders the deleted branch instead of the content', () => {
        const { container } = renderComment(makeComment({ deleted: true }));

        expect(screen.getByText('[deleted]')).toBeTruthy();
        expect(container.querySelector('.comment-text')).toBeNull();
    });
});
