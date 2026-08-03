import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import type { Comment } from '../../shared/models/comment';
import { renderWithProviders } from '../../test/renderWithProviders';
import CommentThread from './CommentThread';

function makeComment(overrides: Partial<Comment> = {}): Comment {
    return {
        id: 1,
        level: 0,
        user: 'pg',
        time: 1175714200,
        time_ago: '2 hours ago',
        content: '<p>Top level</p>',
        deleted: false,
        comments: [],
        ...overrides,
    };
}

describe('CommentThread', () => {
    it('renders the author, age and html content', () => {
        renderWithProviders(<CommentThread comment={makeComment()} />);

        expect(screen.getByRole('link', { name: 'pg' })).toHaveAttribute('href', '/user/pg');
        expect(screen.getByText('2 hours ago')).toBeInTheDocument();
        expect(screen.getByText('Top level')).toBeInTheDocument();
    });

    it('renders nested comments recursively', () => {
        const comment = makeComment({
            comments: [
                makeComment({
                    id: 2,
                    user: 'dhouston',
                    content: '<p>Reply</p>',
                    comments: [makeComment({ id: 3, user: 'jl', content: '<p>Nested reply</p>' })],
                }),
            ],
        });

        renderWithProviders(<CommentThread comment={comment} />);

        expect(screen.getByText('Reply')).toBeInTheDocument();
        expect(screen.getByText('Nested reply')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'jl' })).toBeInTheDocument();
    });

    it('collapses and expands its subtree', async () => {
        const comment = makeComment({ comments: [makeComment({ id: 2, content: '<p>Reply</p>' })] });

        const { container } = renderWithProviders(<CommentThread comment={comment} />);
        const [toggle] = screen.getAllByRole('button', { name: 'Collapse comment' });

        expect(toggle).toHaveTextContent('[-]');
        expect(screen.getByText('Reply')).toBeVisible();

        await userEvent.click(toggle);

        expect(screen.getByRole('button', { name: 'Expand comment' })).toHaveTextContent('[+]');
        expect(screen.getByText('Reply')).not.toBeVisible();
        expect(container.querySelector('.meta-collapse')).not.toBeNull();

        await userEvent.click(screen.getByRole('button', { name: 'Expand comment' }));

        expect(screen.getByText('Reply')).toBeVisible();
    });

    it('collapses only the comment that was clicked', async () => {
        const comment = makeComment({
            content: '<p>Parent</p>',
            comments: [makeComment({ id: 2, content: '<p>Child</p>' })],
        });

        renderWithProviders(<CommentThread comment={comment} />);

        const [, childToggle] = screen.getAllByRole('button', { name: 'Collapse comment' });
        await userEvent.click(childToggle);

        expect(screen.getByText('Parent')).toBeVisible();
        expect(screen.getByText('Child')).not.toBeVisible();
    });

    it('renders a placeholder for deleted comments', () => {
        renderWithProviders(<CommentThread comment={makeComment({ deleted: true })} />);

        expect(screen.getByText('[deleted]')).toBeInTheDocument();
        expect(screen.getByText(/Comment Deleted/)).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'pg' })).not.toBeInTheDocument();
    });
});
