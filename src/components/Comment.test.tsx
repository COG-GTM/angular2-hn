import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import Comment from './Comment';
import { commentTree, makeComment } from '../test/fixtures';
import { renderWithProviders, screen } from '../test/renderWithProviders';

describe('Comment', () => {
    it('renders the comment content, author and time', () => {
        renderWithProviders(<Comment comment={commentTree} />);

        expect(screen.getByText('Top level comment')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'grace' })).toHaveAttribute('href', '/user/grace');
        expect(screen.getAllByText('1 hour ago').length).toBeGreaterThan(0);
    });

    it('renders nested child comments recursively', () => {
        renderWithProviders(<Comment comment={commentTree} />);

        expect(screen.getByText('Child comment')).toBeInTheDocument();
        expect(screen.getByText('Grandchild comment')).toBeInTheDocument();
    });

    it('toggles the collapse state when the collapse control is clicked', async () => {
        const user = userEvent.setup();
        const { container } = renderWithProviders(<Comment comment={commentTree} />);

        const collapse = screen.getAllByText('[-]')[0];
        const tree = container.querySelector('.comment-tree > div') as HTMLElement;
        expect(tree).not.toHaveAttribute('hidden');

        await user.click(collapse);

        expect(screen.getAllByText('[+]')[0]).toBeInTheDocument();
        expect(container.querySelector('.comment-tree > div')).toHaveAttribute('hidden');

        await user.click(screen.getAllByText('[+]')[0]);

        expect(container.querySelector('.comment-tree > div')).not.toHaveAttribute('hidden');
    });

    it('renders a placeholder for deleted comments', () => {
        renderWithProviders(<Comment comment={makeComment({ deleted: true })} />);

        expect(screen.getByText('[deleted]')).toBeInTheDocument();
        expect(screen.getByText(/Comment Deleted/)).toBeInTheDocument();
    });
});
