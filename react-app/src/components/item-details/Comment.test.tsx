import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Comment as CommentModel } from '../../models';
import { renderWithProviders } from '../../test-utils';
import Comment from './Comment';

function buildComment(overrides: Partial<CommentModel> = {}): CommentModel {
    return {
        id: 1,
        level: 0,
        user: 'pg',
        time: 0,
        time_ago: '2 hours ago',
        content: '<p>top level</p>',
        deleted: false,
        comments: [],
        ...overrides,
    };
}

describe('Comment', () => {
    it('renders nested comments recursively', () => {
        const comment = buildComment({
            comments: [buildComment({ id: 2, user: 'dang', content: '<p>reply</p>' })],
        });

        renderWithProviders(<Comment comment={comment} />);

        expect(screen.getByText('top level')).toBeInTheDocument();
        expect(screen.getByText('reply')).toBeInTheDocument();
    });

    it('collapses and expands the comment tree', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Comment comment={buildComment()} />);

        const toggle = screen.getByText('[-]');
        await user.click(toggle);

        expect(screen.getByText('[+]')).toBeInTheDocument();
        expect(screen.getByText('top level').closest('div[hidden]')).not.toBeNull();
    });

    it('renders a placeholder for deleted comments', () => {
        renderWithProviders(<Comment comment={buildComment({ deleted: true })} />);

        expect(screen.getByText('[deleted]')).toBeInTheDocument();
    });
});
