import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Comment } from '../../shared/models';
import { renderWithProviders } from '../../test-utils';
import CommentItem from './Comment';

const greatGrandChild: Comment = {
    id: 4,
    level: 3,
    user: 'great-grandchild-user',
    time: 4,
    time_ago: '30 minutes ago',
    content: '<p>A great grandchild reply</p>',
};

const grandChild: Comment = {
    id: 3,
    level: 2,
    user: 'grandchild-user',
    time: 3,
    time_ago: '1 hour ago',
    content: '<p>A grandchild reply</p>',
    comments: [greatGrandChild],
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
        const { container } = renderWithProviders(<CommentItem comment={root} />);

        expect(screen.getByText('A root comment')).toBeInTheDocument();
        expect(screen.getByText('A child reply')).toBeInTheDocument();
        expect(screen.getByText('A grandchild reply')).toBeInTheDocument();
        expect(screen.getByText('A great grandchild reply')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'grandchild-user' })).toHaveAttribute('href', '/user/grandchild-user');
        expect(container.querySelectorAll('.comment')).toHaveLength(4);
        expect(
            container.querySelector('.comment .comment-tree .comment .comment-tree .comment .comment-tree .comment')
        ).toBeInTheDocument();
    });

    it('collapses a parent without unmounting its subtree', async () => {
        const user = userEvent.setup();
        const { container } = renderWithProviders(<CommentItem comment={root} />);

        const rootToggle = screen.getAllByRole('button')[0];
        const grandChildText = screen.getByText('A grandchild reply');

        await user.click(rootToggle);

        expect(container.querySelector('.comment-tree > div')).toHaveAttribute('hidden');
        expect(screen.getByText('A grandchild reply')).toBe(grandChildText);
        expect(container.querySelectorAll('.comment')).toHaveLength(4);
    });

    it('keeps the collapse state of each comment independent', async () => {
        const user = userEvent.setup();
        const { container } = renderWithProviders(<CommentItem comment={root} />);

        await user.click(screen.getAllByRole('button')[1]);

        const bodies = container.querySelectorAll('.comment-tree > div');

        expect(bodies[0]).not.toHaveAttribute('hidden');
        expect(bodies[1]).toHaveAttribute('hidden');
        expect(bodies[2]).not.toHaveAttribute('hidden');
        expect(screen.getAllByRole('button')[0]).toHaveTextContent('[-]');
        expect(screen.getAllByRole('button')[1]).toHaveTextContent('[+]');
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

    it('toggles the collapse from the keyboard', async () => {
        const user = userEvent.setup();
        const { container } = renderWithProviders(<CommentItem comment={root} />);

        const toggle = screen.getAllByRole('button')[0];
        toggle.focus();

        await user.keyboard('{Enter}');
        expect(container.querySelector('.comment-tree > div')).toHaveAttribute('hidden');

        await user.keyboard(' ');
        expect(container.querySelector('.comment-tree > div')).not.toHaveAttribute('hidden');

        await user.keyboard('{Escape}');
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
