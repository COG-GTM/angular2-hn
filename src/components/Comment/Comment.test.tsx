import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Comment from './Comment';
import { makeComment } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';

describe('Comment', () => {
    it('renders the author, age and html content', () => {
        const { container } = renderWithProviders(<Comment comment={makeComment()} />);

        expect(screen.getByRole('link', { name: 'patio11' })).toHaveAttribute('href', '/user/patio11');
        expect(screen.getByText('1 hour ago')).toBeInTheDocument();
        expect(container.querySelector('.comment-text')?.innerHTML).toBe('<p>A comment</p>');
    });

    it('renders nested replies recursively', () => {
        const comment = makeComment({
            comments: [
                makeComment({ id: 201, user: 'dang', content: '<p>A reply</p>' }),
                makeComment({
                    id: 202,
                    user: 'jl',
                    content: '<p>Another reply</p>',
                    comments: [makeComment({ id: 203, user: 'tptacek', content: '<p>A nested reply</p>' })],
                }),
            ],
        });

        renderWithProviders(<Comment comment={comment} />);

        expect(screen.getByText('A reply')).toBeInTheDocument();
        expect(screen.getByText('A nested reply')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'tptacek' })).toBeInTheDocument();
    });

    it('collapses and expands the thread from the toggle', async () => {
        const comment = makeComment({ comments: [makeComment({ id: 201, content: '<p>A reply</p>' })] });
        const { container } = renderWithProviders(<Comment comment={comment} />);

        const tree = () => container.querySelector('.comment-tree > div');

        expect(screen.getAllByText('[-]')).toHaveLength(2);
        expect(tree()).not.toHaveAttribute('hidden');

        await userEvent.click(screen.getAllByText('[-]')[0]);

        expect(screen.getByText('[+]')).toBeInTheDocument();
        expect(tree()).toHaveAttribute('hidden');
        expect(container.querySelector('.meta')).toHaveClass('meta-collapse');

        await userEvent.click(screen.getByText('[+]'));

        expect(tree()).not.toHaveAttribute('hidden');
    });

    it('collapses a reply without collapsing its parent', async () => {
        const comment = makeComment({ comments: [makeComment({ id: 201, user: 'dang' })] });
        renderWithProviders(<Comment comment={comment} />);

        await userEvent.click(screen.getAllByText('[-]')[1]);

        expect(screen.getByText('[-]')).toBeInTheDocument();
        expect(screen.getByText('[+]')).toBeInTheDocument();
    });

    it('shows a placeholder for deleted comments', () => {
        renderWithProviders(<Comment comment={makeComment({ deleted: true })} />);

        expect(screen.getByText('[deleted]')).toBeInTheDocument();
        expect(screen.getByText(/Comment Deleted/)).toBeInTheDocument();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
});
