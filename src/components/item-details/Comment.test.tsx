import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Comment from './Comment';
import { renderWithProviders } from '../../test/renderWithProviders';
import { mockComment, mockDeletedComment } from '../../test/fixtures';

describe('Comment', () => {
    it('renders the comment meta and content', () => {
        renderWithProviders(<Comment comment={mockComment} />);

        expect(screen.getByRole('link', { name: mockComment.user })).toHaveAttribute(
            'href',
            `/user/${mockComment.user}`
        );
        expect(screen.getByText(mockComment.time_ago)).toBeInTheDocument();
        expect(screen.getByText('A top level comment')).toBeInTheDocument();
    });

    it('renders nested child comments recursively', () => {
        renderWithProviders(<Comment comment={mockComment} />);

        expect(screen.getByText('A nested reply')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'replier' })).toBeInTheDocument();
    });

    it('collapses and expands the comment tree', async () => {
        const { container } = renderWithProviders(<Comment comment={mockComment} />);
        const toggle = screen.getAllByText('[-]')[0];

        await userEvent.click(toggle);

        expect(screen.getByText('[+]')).toBeInTheDocument();
        expect(container.querySelector('.comment-tree > div')).toHaveAttribute('hidden');

        await userEvent.click(screen.getByText('[+]'));

        expect(screen.getAllByText('[-]')).toHaveLength(2);
        expect(container.querySelector('.comment-tree > div')).not.toHaveAttribute('hidden');
    });

    it('renders a placeholder for deleted comments', () => {
        renderWithProviders(<Comment comment={mockDeletedComment} />);

        expect(screen.getByText('[deleted]')).toBeInTheDocument();
        expect(screen.getByText(/Comment Deleted/)).toBeInTheDocument();
    });
});
