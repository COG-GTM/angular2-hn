import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Comment } from '../../shared/models';
import { renderWithProviders } from '../../test-utils';
import CommentItem from './Comment';

const grandChild: Comment = {
    id: 3,
    level: 2,
    user: 'grandchild-user',
    time: 3,
    time_ago: '1 hour ago',
    content: '<p>A grandchild reply</p>',
};

const child: Comment = {
    id: 2,
    level: 1,
    user: 'child-user',
    time: 2,
    time_ago: '2 hours ago',
    content: '<p>A child reply</p>',
    comments: [grandChild],
};

const root: Comment = {
    id: 1,
    level: 0,
    user: 'root-user',
    time: 1,
    time_ago: '3 hours ago',
    content: '<p>A root comment</p>',
    comments: [child],
};

describe('Comment', () => {
    it('renders nested children recursively', () => {
        renderWithProviders(<CommentItem comment={root} />);

        expect(screen.getByText('A root comment')).toBeInTheDocument();
        expect(screen.getByText('A child reply')).toBeInTheDocument();
        expect(screen.getByText('A grandchild reply')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'grandchild-user' })).toHaveAttribute('href', '/user/grandchild-user');
    });

    it('toggles the collapse indicator and hides the comment body', async () => {
        const user = userEvent.setup();
        const { container } = renderWithProviders(<CommentItem comment={root} />);

        const toggle = screen.getAllByRole('button')[0];
        const body = container.querySelector('.comment-tree > div');

        expect(toggle).toHaveTextContent('[-]');
        expect(body).not.toHaveAttribute('hidden');
        expect(container.querySelector('.meta-collapse')).not.toBeInTheDocument();

        await user.click(toggle);

        expect(toggle).toHaveTextContent('[+]');
        expect(container.querySelector('.comment-tree > div')).toHaveAttribute('hidden');
        expect(container.querySelector('.meta-collapse')).toBeInTheDocument();
        expect(screen.getByText('A child reply')).toBeInTheDocument();

        await user.click(toggle);

        expect(toggle).toHaveTextContent('[-]');
        expect(container.querySelector('.comment-tree > div')).not.toHaveAttribute('hidden');
    });

    it('renders the deleted block for deleted comments', () => {
        const { container } = renderWithProviders(
            <CommentItem comment={{ ...root, deleted: true, content: undefined, comments: undefined }} />
        );

        expect(screen.getByText('[deleted]')).toBeInTheDocument();
        expect(container.querySelector('.deleted-meta')).toHaveTextContent('[deleted] | Comment Deleted');
        expect(container.querySelector('.comment-tree')).not.toBeInTheDocument();
    });
});
