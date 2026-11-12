import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { Comment as CommentModel } from '../shared/models/comment';
import { renderWithProviders } from '../test/utils';
import { Comment } from './Comment';

const comment: CommentModel = {
    id: 1,
    level: 0,
    user: 'alice',
    time: 0,
    time_ago: '1 hour ago',
    content: '<p>Parent</p>',
    deleted: false,
    comments: [
        { id: 2, level: 1, user: 'bob', time: 0, time_ago: 'now', content: '<p>Child</p>', deleted: false, comments: [] },
        { id: 3, level: 1, user: '', time: 0, time_ago: '', content: '', deleted: true, comments: [] },
    ],
};

describe('Comment', () => {
    it('renders nested comments, deleted placeholders and collapses the subtree', async () => {
        renderWithProviders(<Comment comment={comment} />);
        expect(screen.getByText('Parent')).toBeVisible();
        expect(screen.getByText('Child')).toBeVisible();
        expect(screen.getByText(/Comment Deleted/)).toBeInTheDocument();

        await userEvent.click(screen.getAllByText('[-]')[0]);
        expect(screen.getByText('[+]')).toBeInTheDocument();
        expect(screen.getByText('Parent')).not.toBeVisible();
        expect(screen.getByText('Child')).not.toBeVisible();
    });
});
