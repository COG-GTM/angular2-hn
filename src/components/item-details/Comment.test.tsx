import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import type { Comment as CommentModel } from '../../models/comment';
import Comment from './Comment';

const comment = {
    id: 1,
    user: 'pg',
    time_ago: '1 hour ago',
    content: '<p>parent</p>',
    deleted: false,
    comments: [
        { id: 2, user: 'kn', time_ago: '30 minutes ago', content: '<p>child</p>', deleted: false, comments: [] },
    ],
} as unknown as CommentModel;

describe('Comment', () => {
    it('renders nested comments and toggles collapse', async () => {
        render(
            <MemoryRouter>
                <Comment comment={comment} />
            </MemoryRouter>
        );

        expect(screen.getByText('child')).toBeInTheDocument();

        await userEvent.click(screen.getAllByText('[-]')[0]);

        expect(screen.getAllByText('[+]')[0]).toBeInTheDocument();
        expect(screen.getByText('child').closest('div[hidden]')).not.toBeNull();
    });

    it('renders a placeholder for deleted comments', () => {
        render(
            <MemoryRouter>
                <Comment comment={{ ...comment, deleted: true }} />
            </MemoryRouter>
        );

        expect(screen.getByText('[deleted]')).toBeInTheDocument();
    });
});
