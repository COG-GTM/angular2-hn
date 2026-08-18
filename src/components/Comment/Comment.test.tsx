import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import Comment from './Comment';
import { Comment as CommentModel } from '../../models';

const comment: CommentModel = {
    id: 1,
    level: 0,
    user: 'devin',
    time: 1600000000,
    time_ago: '1 hour ago',
    content: '<p>Parent comment</p>',
    comments: [
        {
            id: 2,
            level: 1,
            user: 'someone',
            time: 1600000001,
            time_ago: '30 minutes ago',
            content: '<p>Child comment</p>',
            comments: [],
        },
    ],
};

describe('Comment', () => {
    it('renders nested comments', () => {
        render(
            <MemoryRouter>
                <Comment comment={comment} />
            </MemoryRouter>
        );

        expect(screen.getByText('Parent comment')).toBeInTheDocument();
        expect(screen.getByText('Child comment')).toBeInTheDocument();
    });

    it('collapses and expands the comment tree', async () => {
        render(
            <MemoryRouter>
                <Comment comment={comment} />
            </MemoryRouter>
        );

        await userEvent.click(screen.getAllByText('[-]')[0]);
        expect(screen.getByText('Parent comment')).not.toBeVisible();

        await userEvent.click(screen.getAllByText('[+]')[0]);
        expect(screen.getByText('Parent comment')).toBeVisible();
    });

    it('renders a placeholder for deleted comments', () => {
        render(
            <MemoryRouter>
                <Comment comment={{ ...comment, deleted: true }} />
            </MemoryRouter>
        );

        expect(screen.getByText('Comment Deleted', { exact: false })).toBeInTheDocument();
    });
});
