import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Comment from '../components/Comment';
import type { Comment as CommentModel } from '../models/Comment';

const mockComment: CommentModel = {
    id: 1,
    level: 0,
    user: 'testuser',
    time: 1234567890,
    time_ago: '2 hours ago',
    content: '<p>Hello world</p>',
    deleted: false,
    comments: [],
};

function renderComment(comment: CommentModel) {
    return render(
        <MemoryRouter>
            <Comment comment={comment} />
        </MemoryRouter>
    );
}

describe('Comment', () => {
    it('renders comment content', () => {
        renderComment(mockComment);
        expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('toggles collapse on click', () => {
        renderComment(mockComment);
        const toggle = screen.getByText('[-]');
        fireEvent.click(toggle);
        expect(screen.getByText('[+]')).toBeInTheDocument();
        fireEvent.click(screen.getByText('[+]'));
        expect(screen.getByText('[-]')).toBeInTheDocument();
    });

    it('renders deleted comment', () => {
        renderComment({ ...mockComment, deleted: true });
        expect(screen.getByText(/Comment Deleted/)).toBeInTheDocument();
    });
});
